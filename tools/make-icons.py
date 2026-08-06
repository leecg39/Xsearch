#!/usr/bin/env python3
# Xsearch 로고 워터마크 제거 + 아이콘 세트 생성
# 전략: 원본 해상도(265x265)에서 미디안 필터로 워터마크 평탄화 →
#       512x512 업스케일 → 팔레트 스냅(잔여 회색 워터마크를 로고 색으로 흡수) →
#       라벨별 모폴로지 opening(얇은 워터마크 줄무늬 제거, 큰 영역은 보존) →
#       외곽 navy 링 강제 → 아이콘 세트 생성
import sys
from pathlib import Path
from PIL import Image, ImageFilter
import numpy as np

ROOT = Path("/Users/user01/Desktop/Xsearch")
SRC = Path("/Users/user01/.cursor/projects/Users-user01-Desktop-Xsearch/assets/circle-logo-orig-e692e232-d569-430e-b1e4-38a5b690b7da.png")
MARK = ROOT / "assets" / "xsearch-mark.png"
LOGO = ROOT / "assets" / "xsearch-logo.png"
ICONS = [ROOT / "ext" / f"icon{n}.png" for n in (16, 32, 48, 128)]

TARGET = 512
MEDIAN_SIZE = 13
MEDIAN_PASSES = 2
OPEN_RADIUS = 2  # 모폴로지 opening 반경 — 얇은 워터마크 줄무늬(≤4px) 제거, 큰 영역 보존

# 소스에서 추출한 공식 팔레트 (워터마크 없는 본체 색)
PALETTE = [
    (42, 48, 70),     # 다크 네이비 배경/외곽선
    (54, 127, 159),   # 중간 블루 (아이리스)
    (39, 94, 133),    # 어두운 블루 (아이리스 외곽)
    (88, 185, 201),   # 라이트 블루 (배지)
    (252, 162, 67),   # 오렌지 (기어 하이라이트)
    (250, 135, 54),   # 브라이트 오렌지 (기어)
    (197, 76, 60),    # 다크 오렌지 (기어 그림자)
    (250, 251, 246),  # 화이트 (공막/하이라이트)
    (33, 30, 35),     # 검은 동공
]


def nearest_idx(c):
    r, g, b = [int(v) for v in c[:3]]
    best = 0
    best_d = 1 << 30
    for i, (pr, pg, pb) in enumerate(PALETTE):
        d = (r - pr) ** 2 + (g - pg) ** 2 + (b - pb) ** 2
        if d < best_d:
            best_d = d
            best = i
    return best


def opening(mask, radius):
    """모폴로지 opening: erode(MinFilter) → dilate(MaxFilter).
    얇은 돌기/줄무늬는 사라지고 큰 덩어리는 보존."""
    m = (mask.astype(np.uint8)) * 255
    im = Image.fromarray(m, "L")
    k = 2 * radius + 1
    eroded = im.filter(ImageFilter.MinFilter(size=k))
    dilated = eroded.filter(ImageFilter.MaxFilter(size=k))
    return np.array(dilated) > 127


def remove_watermark(src_path: Path) -> Image.Image:
    img = Image.open(src_path).convert("RGB")

    # 1) 원본 해상도에서 미디안 필터 — 워터마크(획 3-4px) 평탄화
    f = img
    for _ in range(MEDIAN_PASSES):
        f = f.filter(ImageFilter.MedianFilter(size=MEDIAN_SIZE))

    # 2) 512x512 업스케일 (LANCZOS)
    out = f.resize((TARGET, TARGET), Image.LANCZOS)
    arr = np.array(out)

    # 3) 팔레트 라벨링 — 잔여 회색 워터마크를 가장 가까운 로고 색으로 흡수
    labels = np.zeros((TARGET, TARGET), dtype=np.int8)
    for y in range(TARGET):
        for x in range(TARGET):
            labels[y, x] = nearest_idx(arr[y, x])

    # 4) 라벨별 모폴로지 opening — 얇은 워터마크 줄무늬 제거
    #    navy(0)는 배경/외곽선 역할이므로 그대로 두고, 나머지 색 라벨만 opening.
    #    opening 으로 제거된 얇은 부분은 navy 배경으로 되돌림.
    new_labels = labels.copy()
    for lid in range(1, len(PALETTE)):
        mask = labels == lid
        if mask.sum() == 0:
            continue
        opened = opening(mask, OPEN_RADIUS)
        removed = mask & ~opened
        new_labels[opened] = lid
        new_labels[removed] = 0  # 얇은 줄무늬 → navy 배경/외곽선 색으로

    # 5) 라벨 → RGB
    result = np.zeros((TARGET, TARGET, 3), dtype=np.uint8)
    for i, c in enumerate(PALETTE):
        result[new_labels == i] = c

    # 6) 외곽 navy 링 강제: 중심 거리 > 248 은 로고 원 바깥 navy 배경
    yy, xx = np.mgrid[0:TARGET, 0:TARGET]
    r = np.sqrt((yy - TARGET / 2) ** 2 + (xx - TARGET / 2) ** 2)
    result[r > 248] = PALETTE[0]

    return Image.fromarray(result, "RGB").convert("RGBA")


def main():
    if not SRC.exists():
        print(f"ERROR: 소스 없음: {SRC}", file=sys.stderr)
        sys.exit(1)

    print(f"소스: {SRC.name} ({Image.open(SRC).size})")
    mark = remove_watermark(SRC)

    MARK.parent.mkdir(parents=True, exist_ok=True)
    mark.save(MARK, format="PNG")
    print(f"저장: {MARK} ({mark.size}, {mark.mode})")

    mark.save(LOGO, format="PNG")
    print(f"저장: {LOGO} (원형 로고 그대로)")

    for icon in ICONS:
        n = int("".join(c for c in icon.stem if c.isdigit()))
        sized = mark.resize((n, n), Image.LANCZOS)
        sized.save(icon, format="PNG")
        print(f"저장: {icon} ({n}x{n})")

    print("완료")


if __name__ == "__main__":
    main()

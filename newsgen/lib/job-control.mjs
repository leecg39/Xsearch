/** 생성 작업 승인 정책: 같은 날짜 충돌을 막고 전역 동시 실행 수를 제한한다. */
export function generationAdmission(jobs, date, maxActiveJobs) {
  const active = [...jobs.values()].filter((job) => job.status === 'running');
  if (active.some((job) => job.date === date)) {
    return { statusCode: 409, error: `${date} 생성 작업이 이미 진행 중입니다` };
  }
  if (active.length >= maxActiveJobs) {
    return { statusCode: 429, error: `동시에 최대 ${maxActiveJobs}개 작업만 실행할 수 있습니다` };
  }
  return null;
}

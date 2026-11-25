# 전달 자료 목록과 보관 기준 — v0.2

- 수신·정리일: 2026-11-24
- 원본 위치: 작업 PC의 `~/Desktop/ProjectData/x23hash/` (`dev/` 16개, `UI/` 12개)
- 원문 버전: `Dev v0.2 · 2026.11.19`. 이전 자료(v0.1, 구현 기준 v1 · 2026.10.20)는 [이전 스냅샷](../tomyx-2026-10-20/README.md)에 그대로 둡니다.
- 확인 범위: PDF 28개, 각 1페이지. 개발 명세 16개(공통 문서 A–F와 화면 흐름 01–08) + UI 12개(컴포넌트·배경·화면 흐름 01–08·보류 2개).
- 현재 기준: [v0.2 반영 계획](../../specs/v02-update.md)과 [제품 명세 총괄](../../specs/product-overview.md). 자료는 "UI 페이지의 화면이 정답, Dev 페이지의 화면 이미지는 같은 날짜의 사본"이라고 밝힙니다.

## 보관 방식

- [개발 명세 원문](dev.md): 한눈에 보기, 변경점, 결정 필요, 공통 규칙·데이터, 디자인 토큰, 랜덤·배정 규칙과 화면 흐름 01–08의 명세 표.
- [UI 원문](ui.md): 화면 속 문구와 프레임 설명. 배치·색·크기는 아래 미리보기로 확인합니다.
- `previews/`: UI PDF 12개를 72dpi(1pt = 1px, 화면 한 장이 375px 폭)로 렌더한 참고 PNG. 제품용 이미지·아이콘·폰트 자산이 아닙니다.
- [sha256.txt](sha256.txt): 원본 PDF의 SHA-256 전체 값. 약 49 MB의 PDF 바이너리는 복제하지 않았습니다.

자료 속 기본값은 전달 문서에서 채택한 기준입니다. 서버 구현 완료, 법무 승인, 실제 QA 통과를 뜻하지 않습니다. 화면 번호는 v0.1과 다르며 대응은 [개발 명세 원문](dev.md#source-dev-B)의 번호 매핑을 따릅니다.

## 전체 파일과 반영 위치

| 자료 ID | 원본 상대 경로 | 원문 | 반영 위치 | SHA-256 앞 16자 | 크기 |
| --- | --- | --- | --- | --- | --- |
| dev-00 | dev/00 · 한눈에 보기 — 여기부터 읽으세요.pdf | [추출문](dev.md#source-dev-00) | [제품 명세 총괄](../../specs/product-overview.md) | `74de0e556e3b7da4…` | 1.8 MB |
| dev-00-B | dev/00-B · 피드 배경.pdf | [추출문](dev.md#source-dev-00-B) | [피드](../../specs/story-feed.md) | `697512ea6524e948…` | 0.7 MB |
| dev-01 | dev/01 · 첫 방문 — 랜덤 시뮬레이션.pdf | [추출문](dev.md#source-dev-01) | [첫 방문](../../specs/onboarding-simulation.md) | `d143472ff6fba387…` | 8.5 MB |
| dev-02 | dev/02 · 글쓰기.pdf | [추출문](dev.md#source-dev-02) | [글쓰기](../../specs/story-writing.md) | `f9a5d24fdf491a9c…` | 3.0 MB |
| dev-03 | dev/03 · 메인 피드.pdf | [추출문](dev.md#source-dev-03) | [피드](../../specs/story-feed.md) | `0dd9ccbc58dee5e1…` | 3.3 MB |
| dev-04 | dev/04 · 알림.pdf | [추출문](dev.md#source-dev-04) | [알림](../../specs/story-feed.md) | `697f473b12cd5f8f…` | 0.3 MB |
| dev-05 | dev/05 · MY.pdf | [추출문](dev.md#source-dev-05) | [MY](../../specs/story-feed.md) | `202d4398eca5d269…` | 2.1 MB |
| dev-06 | dev/06 · 마음 관리.pdf | [추출문](dev.md#source-dev-06) | [마음 관리](../../specs/story-feed.md) | `d32c58cede398121…` | 2.5 MB |
| dev-07 | dev/07 · 로그인.pdf | [추출문](dev.md#source-dev-07) | [로그인](../../specs/account-access.md) | `40dc01187b4f1f73…` | 2.4 MB |
| dev-08 | dev/08 · 설정.pdf | [추출문](dev.md#source-dev-08) | [설정](../../specs/account-access.md) | `374fdfbbdd439e5a…` | 0.8 MB |
| dev-A | dev/A · 개요.pdf | [추출문](dev.md#source-dev-A) | [제품 명세 총괄](../../specs/product-overview.md) | `b6edf5c11780d878…` | 0.3 MB |
| dev-B | dev/B · v0.1 → v0.2 변경점.pdf | [추출문](dev.md#source-dev-B) | [v0.2 반영 계획](../../specs/v02-update.md) | `60ab812cbfbd8ee6…` | 0.4 MB |
| dev-C | dev/C · 결정 필요.pdf | [추출문](dev.md#source-dev-C) | [v0.2 반영 계획](../../specs/v02-update.md) | `8f84723d6c103d79…` | 0.1 MB |
| dev-D | dev/D · 공통 규칙 · 데이터.pdf | [추출문](dev.md#source-dev-D) | [공통 계약](../../specs/service-contracts.md) | `e008296067aeba21…` | 1.2 MB |
| dev-E | dev/E · 디자인 토큰 · 컴포넌트.pdf | [추출문](dev.md#source-dev-E) | [디자인 시스템](../../specs/design-system.md) | `f417983e96c5fe26…` | 1.0 MB |
| dev-F | dev/F · 랜덤 · 배정 규칙.pdf | [추출문](dev.md#source-dev-F) | [첫 방문·배경 배정](../../specs/onboarding-simulation.md) | `382a4ece0813c60d…` | 0.4 MB |
| ui-00-A | UI/00-A · NIGHT UI — 컴포넌트.pdf | [추출문](ui.md#source-ui-00-A) | [디자인 시스템](../../specs/design-system.md) | `4328054e18616f7c…` | 1.2 MB |
| ui-00-B | UI/00-B · 피드 배경 프리셋 — 사진 없는 글에 랜덤 적용.pdf | [추출문](ui.md#source-ui-00-B) | [피드](../../specs/story-feed.md) | `62aa7572c7289ac8…` | 0.6 MB |
| ui-01 | UI/01 · 첫 방문 — 랜덤 시뮬레이션 (카톡 · 인스타 · 자니).pdf | [추출문](ui.md#source-ui-01) | [첫 방문](../../specs/onboarding-simulation.md) | `990c7dca2539f0f3…` | 7.9 MB |
| ui-02 | UI/02 · 글쓰기 — 본문 입력 · 내 사진 · 등록.pdf | [추출문](ui.md#source-ui-02) | [글쓰기](../../specs/story-writing.md) | `571ded61edea3452…` | 2.4 MB |
| ui-03 | UI/03 · 메인 피드 — 전체보기 · 빈 상태 · 오류.pdf | [추출문](ui.md#source-ui-03) | [피드](../../specs/story-feed.md) | `f575649fa3ec7e09…` | 3.0 MB |
| ui-04 | UI/04 · 알림 — 목록 · 빈 상태.pdf | [추출문](ui.md#source-ui-04) | [알림](../../specs/story-feed.md) | `5b4f59b9354e17bd…` | 0.2 MB |
| ui-05 | UI/05 · MY — 내 마음 · 수정 · 삭제 · 공유.pdf | [추출문](ui.md#source-ui-05) | [MY](../../specs/story-feed.md) | `b4ef319c845f4c90…` | 1.7 MB |
| ui-06 | UI/06 · 마음 관리 — 공유 · 숨기기 · 신고 · 차단.pdf | [추출문](ui.md#source-ui-06) | [마음 관리](../../specs/story-feed.md) | `a0acec924f2a043a…` | 2.3 MB |
| ui-07 | UI/07 · 로그인 — 둘러보기는 자유롭게 · 필요한 순간에만.pdf | [추출문](ui.md#source-ui-07) | [로그인](../../specs/account-access.md) | `0ed0d3ace6e70d69…` | 2.2 MB |
| ui-08 | UI/08 · 설정 — 계정 · 약관 · 로그아웃 · 탈퇴.pdf | [추출문](ui.md#source-ui-08) | [설정](../../specs/account-access.md) | `aa93f9f2af9e0209…` | 0.6 MB |
| ui-hold-note | UI/보류 · 쪽지 숨기기 (출시 제외).pdf | [추출문](ui.md#source-ui-hold-note) | [보류(구현 제외)](../../specs/v02-update.md) | `d10e154de233148f…` | 0.6 MB |
| ui-hold-ads | UI/보류 · 피드 광고 (출시 제외).pdf | [추출문](ui.md#source-ui-hold-ads) | [보류(구현 제외)](../../specs/v02-update.md) | `d0b1c7e453bfdd62…` | 0.5 MB |

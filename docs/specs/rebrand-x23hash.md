# 서비스 이름 변경 — ToMyX → *23# (x23hash)

## 문서 정보

- 유형: 설정·배포 흐름
- 명세 상태: 확정 (일부 외부 설정 대기)
- 구현 상태: 코드·설정·CI·문서 변경을 develop에 반영, 웹 develop 배포 완료, main 반영과 새 앱 빌드 미실행
- 검증 상태: 로컬 검증 통과, 실제 배포·기기 검증 미실행
- 갱신일: 2026-11-18
- 입력 자료: 사용자 요청(2026-11-18). 서비스 이름이 여러 문제로 `*23#`으로 바뀌었고, 기호를 쓸 수 없는 식별자는 `x23hash`로 정했습니다.
- 확정 근거: 아래 결정 기록의 사용자 답변(2026-11-18)
- 관련 통합 스펙: [빌드와 배포](build-deploy.md), [앱 테스트 자동화](app-test-automation.md), [로그인·동의·설정·계정 종료](account-access.md)
- 관련 정책: 없음

## 1. 목적과 범위 — PRD

- 해결할 문제: 서비스 이름 변경에 따라 사용자에게 보이는 이름·주소와 스토어 식별자를 모두 새 이름으로 바꿉니다.
- 핵심 판단: Android 패키지명, iOS 번들 ID, Apple 개발자 계정이 모두 바뀌므로 스토어에서는 이름 변경이 아니라 새 앱 등록입니다. 기존 서명 키·버전 번호·테스터 목록은 이어받지 않습니다. 기존 것을 고치지 않고 새 식별자로 나란히 세운 뒤, 검증되면 옛것을 내립니다.
- 포함 범위: 앱 설정(`app.json`·`eas.json`·`package.json`), 딥링크 스킴, 화면 문구, 브라우저·기기 저장 키, 공유 링크 기본 주소, 테스트, CI, 문서, 임시 에셋, 스토어·카카오·Expo 재등록 안내.
- 제외 범위: Git 이력, `docs/references/`의 과거 스냅샷([문서 목록](../README.md)의 고정 스냅샷 원칙), 서버 코드와 API 도메인(서버 담당 결정).

### 요구사항

| ID | 요구사항 | 확정 근거 | 확정 여부 |
| --- | --- | --- | --- |
| R-01 | 패키지명은 `com.x23hash.ios`, `com.x23hash.android`를 씁니다. | 사용자 답변 | 확정 |
| R-02 | 웹은 Cloudflare Pages에 배포합니다. 우선 무료 기본 주소(`<프로젝트명>.pages.dev`, 희망 `x23hash.pages.dev`)로 운영하고 도메인은 나중에 구입해 같은 프로젝트에 연결합니다. 도메인 연결 후에도 기본 주소는 계속 동작하므로 그 사이 공유된 링크는 끊기지 않습니다. Expo 호스팅 구독은 하지 않습니다. | 사용자 답변(2026-11-18 변경) | 확정 |
| R-03 | 카카오 앱은 기존 앱을 유지하고 플랫폼 정보만 추가 등록합니다. 앱 키와 회원 번호가 유지됩니다. 서버가 회원을 `provider`+`provider_user_id`(카카오 회원번호)로 식별하므로(백엔드 `OAuthAccount`, 2026-11-18 확인) 기존 계정과 작성 글이 그대로 이어집니다. | 사용자 답변 | 확정 |
| R-04 | 기존 주소(`to-my-x.expo.app`)로 공유된 링크는 넘겨주지 않습니다. | 사용자 답변 | 확정 |
| R-05 | 아이콘·스플래시·파비콘은 임시 에셋으로 먼저 진행하고 디자인을 받으면 교체합니다. | 사용자 답변 | 확정 |
| R-06 | 표시 이름은 `*23#`이며, 스토어에서 기호가 거부되면 `x23hash`를 씁니다. | 사용자 답변 | 확정 |
| R-07 | 저장 키 `tomyx.*.v1` 5종은 `x23hash.*`로 바꿉니다. 웹은 도메인이 바뀌면 저장소가 비고 앱은 새로 설치되므로 이전 처리는 하지 않습니다. | 사용자 작업 지시(2026-11-18, 범위에 포함해 안내 후 시작) | 확정 |

## 2. 정보 구조와 흐름 — IA

화면 구조 변경은 없습니다. 진행 순서만 정합니다.

1. 결정 확정(5장의 미결정 사항)
2. 외부 등록: Apple(새 계정의 번들 ID·App Store Connect 앱), Google Play(새 패키지 앱·내부 테스트 트랙), 카카오(Android 패키지·iOS 번들 ID·웹 도메인·Redirect URI), Expo(조직 이름 변경, 프로젝트는 재사용)
3. 코드·설정·문서 변경(PR 1개)
4. 새 네이티브 빌드와 제출. Play 앱 서명 키가 새로 생기므로 카카오 키 해시 3종(디버그·업로드·Play 서명)을 다시 등록합니다.
5. iOS 시뮬레이터·Android 실기기·웹에서 로그인부터 등록까지 재검증
6. 전환과 정리: 구 앱의 내부 테스트 종료

## 3. 구현 설계 — Tech Spec

### 변경 대상(2026-11-18 조사)

| 구분 | 현재 | 변경 |
| --- | --- | --- |
| 앱 표시 이름 | `to-my-x` | `*23#`(`plugins/with-display-name.js`가 iOS `CFBundleDisplayName`과 Android `app_name`에 지정, `app.json`의 `name`은 `x23hash`) |
| npm 패키지명 | `to-my-x` | `x23hash` |
| Expo slug | `to-my-x` | 유지(변경 기능 없음, 사용자에게 보이지 않음) |
| Expo 조직(`app.json`의 `owner`) | `to-my-x` | `x23hash`(2026-11-18 조직 이름 변경 완료, 코드 반영 필요) |
| iOS 번들 ID·Android 패키지 | `com.tomyx.ios`·`com.tomyx.android` | `com.x23hash.ios`·`com.x23hash.android` |
| 딥링크 스킴 | `tomyx` | `x23hash` |
| Expo 프로젝트 | projectId `2661f041…`, ascAppId `6824389886` | projectId 유지, ascAppId `6836202739`(새 Apple 계정의 앱) |
| 웹 주소 | `to-my-x.expo.app` | `x23hash.pages.dev`(develop 미리보기는 `develop.x23hash.pages.dev`) |
| 화면 문구 `To My X` | 피드 헤더, 온보딩, 상세·MY·등록·탈퇴(6개 파일) | `*23#` |
| 저장 키 | `tomyx.auth.v1` 등 5종 | `x23hash.*` |
| 문서 | `AGENTS.md`, `README.md`, `LICENSE`, 스펙·정책 약 20개 | 일괄 갱신 |

### 사전 확인으로 정해진 구현 조건(2026-11-18)

- `app.json`의 `name`에 `*23#`을 그대로 넣으면 iOS 네이티브 프로젝트 생성이 실패합니다(`Could not find target '23'`, 임시 복사본에서 `expo prebuild`로 확인). `name`은 `x23hash`로 두고 화면에 보이는 이름 `*23#`은 표시 이름 설정으로 따로 지정합니다.
- Cloudflare Pages는 GitHub 연동이 아니라 Direct Upload 방식으로 만듭니다. 빌드는 기존 GitHub Actions가 하고 결과물만 `wrangler pages deploy`로 올립니다. Direct Upload로 만든 프로젝트는 이후 Git 연동으로 바꿀 수 없으므로([Cloudflare 문서](https://developers.cloudflare.com/pages/get-started/direct-upload/)) 대시보드에서 저장소를 연결해 만들지 않습니다. 필요한 값은 API 토큰과 Account ID이며 GitHub Secrets에 둡니다.
- 아이콘·스플래시는 현재 Expo 기본 템플릿 이미지라 옛 이름이 없습니다. 새 디자인을 받을 때까지 그대로 임시 에셋으로 씁니다.
- 탈퇴 완료 문구("그동안 To My X를 이용해 주셔서")는 새 이름의 읽는 법에 따라 조사가 달라져 사용자 확인이 필요합니다.

### 서버에 요청할 항목

- CORS 허용 출처와 카카오 Redirect URI에 새 웹 주소 추가(`https://x23hash.pages.dev`, develop 미리보기 `https://develop.x23hash.pages.dev`)
- 새 네이티브 앱 키를 쓰기로 하면 서버의 허용 `aud`에 새 키 추가(5장 미결정 사항 참고)
- 서버가 내려주는 `shareUrl`의 기본 주소 변경
- 약관·개인정보처리방침의 서비스명 변경(버전이 오르면 재동의가 표시됨)
- API 주소(`api-tomyx.rhkr8521.com`) 변경 여부

### 플랫폼 조건

| 대상 | 제약 | 검증 환경 |
| --- | --- | --- |
| 웹 | Cloudflare Pages에 배포. 동적 라우트는 `public/_redirects`로 연결 | Chromium |
| Android | 새 Play 앱. 첫 AAB는 수동 업로드, 이후 자동 제출 | 실기기 |
| iOS | 다른 Apple 계정. 인증서·프로비저닝·제출 키를 새로 설정 | 시뮬레이터·TestFlight |

## 4. 완료 조건과 검증

| ID | 조건·기대 결과 | 검증 방법 | 결과 |
| --- | --- | --- | --- |
| AC-01 | 코드·설정에 사용자에게 보이는 옛 이름이 남지 않는다(제외 범위 제외). | 저장소 검색 | 통과(2026-11-18). 남은 것은 Expo slug `to-my-x`와 API 주소 `api-tomyx.rhkr8521.com`뿐이며 둘 다 의도한 유지입니다. 웹 빌드 결과물 `dist`에도 옛 이름이 없습니다. |
| AC-02 | 새 웹 주소에서 카카오 로그인·피드·등록이 동작한다. | 웹 실서버 | 미실행 |
| AC-03 | 새 패키지의 Android 앱에서 카카오 로그인이 동작한다. | 내부 테스트 설치 실기기 | 미실행 |
| AC-04 | 새 번들 ID의 iOS 앱에서 카카오 로그인이 동작한다. | 시뮬레이터·TestFlight | 미실행 |

## 5. 미결정 사항

| 질문 | 영향과 확인할 대상 | 구현을 막는가? |
| --- | --- | --- |
| GitHub 저장소의 새 이름 | 조직은 `x23hash`로 바꿉니다(사용자 결정 2026-11-18). 저장소 이름 제안은 `x23hash-frontend`이며 서버 저장소는 서버 담당이 정합니다. | 막지 않음 |
| Expo 조직 이름 변경 후 기존 `EXPO_TOKEN`이 유효한지 | Expo 조직도 `x23hash`로 바꿉니다(사용자 결정 2026-11-18). 변경은 소유자만 가능하고 횟수 제한이 있습니다. 토큰 유효성은 문서에 없어 변경 후 CI로 확인합니다. | 막지 않음 |
| 개인 Apple 계정에서 API 키만으로 서명 인증서를 만들 수 있는지 | 새 Apple 계정은 개인 멤버십입니다(사용자 확인 2026-11-18). 비밀번호를 넘겨받지 않고 계정 주인이 사용자를 App Store Connect Admin으로 초대합니다. 개인 계정의 초대 사용자는 App Store Connect만 쓸 수 있고 서명 인증서는 계정 주인만 만들 수 있어([Apple 역할 문서](https://developer.apple.com/help/account/access/roles/), [Expo 문서](https://docs.expo.dev/app-signing/apple-developer-program-roles-and-permissions/)) 계정 주인의 1회 설정(번들 ID 등록, API 키 발급)이 필요합니다. 키로 인증서 생성이 안 되면 계정 주인이 `eas credentials` 로그인을 1회 합니다. 인증서는 1년마다 갱신합니다. | iOS 빌드 전에 필요 |
| 스토어 판매자 이름에 계정 주인 실명이 표시되는 점 | 개인 계정의 제약입니다. 계정 주인의 동의가 필요합니다. | iOS 등록 전에 필요 |
| Google Play 비공개 테스트 요건 해당 여부 | 2023-11-13 이후 만든 개인 개발자 계정은 앱마다 테스터 12명·14일 비공개 테스트 후에 프로덕션 출시가 가능합니다. 새 앱은 이 기간을 처음부터 다시 채웁니다. Play Console에서 계정 유형을 확인합니다. | 프로덕션 출시 일정에 영향 |
| Cloudflare Pages 프로젝트명 확보 | `x23hash.pages.dev`는 2026-11-18 조회 시 미사용(NXDOMAIN)이지만 프로젝트를 만들어야 확정됩니다. 이 주소가 카카오 Redirect URI, 서버 CORS·`shareUrl`에 들어갑니다. | 외부 등록 전에 필요 |
| 새 앱에 쓸 카카오 네이티브 앱 키 | 사용자가 기존 카카오 앱 안에 네이티브 앱 키 `X23Hash Key`를 새로 만들어 새 패키지·번들 ID를 등록했습니다(2026-11-18). 서버는 ID 토큰의 `aud`로 REST API 키와 네이티브 앱 키 1개만 허용하므로(백엔드 `KakaoProperties.audiences()`, `TOMYX_KAKAO_NATIVE_APP_KEY`) 새 키를 쓰면 서버 설정 변경이 필요합니다. 새 키를 쓸지(서버 값 교체 또는 두 키 동시 허용), 새 키를 지우고 기본 키에 새 패키지·번들 ID를 추가할지 정해야 합니다. 키 하나에는 패키지를 1개만 등록할 수 있어(사용자가 콘솔에서 확인, 2026-11-18) 추가는 불가능하고, 사용자 제안은 기본 키의 패키지·번들 ID를 새 값으로 교체하고 새 키는 쓰지 않는 것입니다. 이 경우 서버와 프론트의 키 값은 그대로이고, 교체하는 순간 옛 패키지(`com.tomyx.*`) 앱과 개발 빌드의 카카오 로그인이 막히므로 교체 시점은 새 식별자 빌드를 테스트할 때로 잡습니다. 프론트는 `app.json`의 `nativeAppKey`와 `EXPO_PUBLIC_KAKAO_NATIVE_APP_KEY`가 대상입니다. 같은 카카오 앱이므로 회원번호는 키와 무관하게 유지됩니다(첫 로그인에서 기존 글 표시로 확인). | 네이티브 빌드 전에 필요 |
| 구입할 도메인 이름과 시기 | 연결 시 카카오·서버에 주소를 추가 등록하고 `shareUrl` 기본 주소를 바꿉니다. 웹 로그인 상태는 주소별 저장이라 한 번 초기화됩니다. | 막지 않음 |
| Cloudflare Pages에서 동적 라우트(`stories/[id]`, `legal/[kind]`)가 동작하는지 | Expo 호스팅은 필수가 아니고([공식 문서](https://docs.expo.dev/guides/publishing-websites/)) 이 프로젝트는 서버 기능 없는 정적 출력이라 이전 자체는 가능합니다. 주소 재작성 규칙은 실제 배포로 확인합니다. | 웹 전환 전에 필요 |

## 6. 결정·변경 기록

| 날짜 | 변경 내용과 이유 | 확정 근거 | 영향 |
| --- | --- | --- | --- |
| 2026-11-18 | 이름 변경 계획 수립, R-01~R-06 확정 | 사용자 답변 | 본 문서 |
| 2026-11-18 | 변경 사유는 브랜딩이며 법적 문제가 아닙니다. 공개 저장소를 비공개로 돌리거나 이력을 지울 필요는 없습니다. | 사용자 답변 | GitHub 처리 방향 |
| 2026-11-18 | Expo는 새 프로젝트를 만들지 않고 기존 프로젝트(ID `2661f041…`)를 이름만 바꿔 계속 씁니다. 서명 자격증명은 패키지·번들 ID별로 따로 저장되어 한 프로젝트 안에서 공존하고, 프로젝트 ID·`EXPO_TOKEN`·업데이트 주소가 그대로 유지됩니다. 조회 시점(2026-11-18)의 서버 값은 아직 `@to-my-x/to-my-x`입니다. 조직 이름이나 slug가 실제로 바뀌면 `app.json`의 `owner`·`slug`를 같이 바꿔야 EAS 명령과 CI가 동작합니다. | 사용자 제안, `eas project:info` 조회 | 3장 변경 대상 표의 "새 프로젝트", IA 2단계 |
| 2026-11-18 | 외부 등록 진행 상황: GitHub 조직 `x23hash`, 프론트 저장소 `x23hash-frontend`로 변경 완료(서버 저장소는 `to-my-x-backend` 그대로). Cloudflare Pages 프로젝트 `x23hash`를 Direct Upload 방식으로 생성했고 주소는 `x23hash.pages.dev`로 확정(`wrangler pages project list`로 확인, Git Provider 없음). Cloudflare API 토큰(Pages 편집 권한만)과 Account ID를 저장소 Secrets `CLOUDFLARE_API_TOKEN`·`CLOUDFLARE_ACCOUNT_ID`로 등록했습니다(이름만 조회 확인, 값의 유효성은 첫 배포에서 확인). 기존 `EXPO_TOKEN`과 변수는 저장소 이름 변경 후에도 유지됩니다. | 사용자 작업, 조회 확인 | CI 웹 배포 단계, 로컬 `origin` 주소 |
| 2026-11-18 | Expo 조직 이름을 `x23hash`로 변경 완료(`eas whoami`로 확인). 프로젝트는 `@x23hash/to-my-x`가 됐고 slug는 대시보드에 변경 기능이 없어 `to-my-x`로 둡니다. slug 하나 때문에 새 프로젝트를 만들면 프로젝트 ID·업데이트 주소·EAS 환경 변수·제출 자격증명·채널을 다시 연결해야 하는데, slug는 대시보드 주소와 내부 식별자에만 쓰여 얻는 것이 없습니다. `app.json`의 `owner`가 아직 `to-my-x`라 EAS 명령과 CI 배포 단계가 실패하는 상태이며 `owner` 한 줄 수정이 필요합니다. | 사용자 작업·결정 | `app.json` |
| 2026-11-18 | 외부 등록 완료 보고: 백엔드 요청 전달, Apple(Admin 초대·번들 ID·API 키·새 앱 생성, 앱 ID `6836202739`), 카카오(Redirect URI·앱 이름), Google Play(새 앱·내부 테스트 트랙). 조회로 확인한 것: 서버 CORS는 아직 `https://x23hash.pages.dev`를 거부합니다(preflight 403, 옛 주소는 200). 카카오 Redirect URI는 로그인 후에 검사되어 외부 조회로 확인할 수 없고 첫 웹 로그인에서 확인합니다. | 사용자 작업, `curl` 조회 | `eas.json`의 `ascAppId`, AC-02 |
| 2026-11-18 | R-02를 `x23hash.expo.app`에서 자체 도메인 + Cloudflare Pages로 변경. 도메인 하나 때문에 Expo 구독(월 $19)을 하지 않기 위함이며, 출시 후 주소를 다시 바꾸면 공유 링크가 끊기므로 이름 변경과 함께 진행합니다. | 사용자 답변 | CI 웹 배포 단계, [빌드와 배포](build-deploy.md) |
| 2026-11-18 | 코드 작업 완료(사용자 시작 지시). `app.json`(이름·스킴·번들 ID·패키지·`owner`·표시 이름 플러그인), `eas.json`의 `ascAppId`, 패키지 이름, 화면 문구, 저장 키 5종, 공유 링크 기본 주소, 테스트 픽스처, CI 웹 배포(`wrangler pages deploy`), `public/_redirects`, `404.html` 생성, 문서를 바꿨습니다. 검증: lint·타입 검사·단위 테스트 22개 통과, 임시 복사본 `expo prebuild`에서 iOS 표시 이름 `*23#`·번들 ID·스킴과 Android `app_name`·`applicationId`·스킴 확인, `eas project:info`가 `@x23hash/to-my-x`로 인식, 웹 빌드 후 `wrangler pages dev`에서 `/stories/123`·`/legal/terms`가 해당 화면으로 열리고 없는 주소는 404 응답. | 사용자 지시, 로컬 검증 | 전 범위 |
| 2026-11-18 | 탈퇴 완료 문구는 `*23#`을 "별이삼샵"으로 읽는다고 가정해 "그동안 *23#을 이용해 주셔서"로 뒀습니다. 읽는 법은 사용자 확인 전입니다. | 가정(미확인) | `DeleteAccountScreen.tsx` |
| 2026-11-18 | 문서의 날짜가 붙은 과거 기록(옛 주소·옛 패키지·Actions 링크, 입력 자료 폴더명 `ToMyX`)은 이력이라 고치지 않았습니다. 현재 값은 각 스펙의 2026-11-18 기록에 따로 적었습니다. `LICENSE`의 저작권 표기는 GitHub 조직 이름에 맞춰 `x23hash`로 바꿨습니다. | 문서 원칙 | `docs/` |
| 2026-11-18 | 남은 일: develop 미리보기 주소(`develop.x23hash.pages.dev`)의 카카오 Redirect URI·서버 CORS 등록, 서버 CORS 반영 확인, 새 식별자의 서명·제출 자격증명(Apple API 키 `.p8`의 EAS 등록 포함), 첫 AAB 수동 업로드, 카카오 기본 키의 패키지·번들 ID 교체와 새 키 해시 등록, 새 빌드 설치 검증(AC-02~04). 브라우저 탭 제목은 옛 사이트부터 비어 있었고 이번 범위에서 추가하지 않았습니다. | 작업 결과 | 다음 단계 |
| 2026-11-18 | develop에 반영(커밋 `2267ecd`·`3ddfa20`·`08cd0ec`)했고 첫 Cloudflare 배포가 성공했습니다(Actions 44252478283). Secrets의 토큰·Account ID가 유효하고, `https://develop.x23hash.pages.dev`에서 `/`·`/stories/123`·`/legal/terms`가 200, 없는 주소가 404로 응답합니다. 프로덕션 주소 `x23hash.pages.dev`는 main 배포 전이라 404입니다. 서버 CORS는 두 주소 모두 아직 403이라 데이터 로딩과 로그인(AC-02)은 확인하지 못했습니다. | Actions 실행, `curl` 조회 | AC-02, 다음 단계 |
| 2026-11-18 | 새 Apple 계정의 App Store Connect API 키를 EAS에 제출용으로 등록하고 `com.x23hash.ios`에 연결했습니다(사용자가 `eas credentials`에서 Apple 로그인 없이 `.p8`을 입력, Apple 인증이 없어 키 검증은 생략됨 → 첫 제출에서 확인). 본인 Apple ID로 로그인하면 옛 개인 팀(`B9PUAVBBKX`)만 잡히므로 이 프로젝트의 자격증명 설정에서는 Apple 로그인을 하지 않습니다. 빌드용 배포 인증서·프로비저닝은 아직 없습니다. | 사용자 터미널 기록 | iOS 빌드 전 준비 |
| 2026-11-18 | iOS `testing` 빌드를 비대화형으로 시도했으나 빌드 시작 전에 중단됐습니다(`Distribution Certificate is not validated for non-interactive builds` → `Credentials are not set up. Run this command again in interactive mode`). App Store Connect API 키 환경 변수(`EXPO_ASC_*`, `EXPO_APPLE_TEAM_ID=R4PW5MSL4D`, `EXPO_APPLE_TEAM_TYPE=INDIVIDUAL`)를 줘도 비대화형 모드는 최초 자격증명을 만들지 않습니다. 원격 빌드는 생성되지 않았고, 원격 buildNumber만 1로 초기화됐습니다. 최초 1회는 같은 환경 변수를 준 대화형 `eas credentials`로 배포 인증서·프로비저닝을 만들어야 합니다. | `eas build` 실행 로그 | iOS 빌드 전 준비 |
| 2026-11-18 | iOS 새 앱 첫 빌드와 제출. 사용자가 `EXPO_ASC_*` 환경 변수를 준 대화형 `eas credentials`로 배포 인증서와 프로비저닝을 새 팀 `R4PW5MSL4D` 소속으로 만들었습니다(개인 계정에서도 API 키 방식 동작 확인). 2차 빌드 `e3b1abec`는 로컬과 EAS의 fingerprint가 달라 `Configure expo-updates` 단계에서 실패했습니다(원인과 조치는 [실수 기록](../harness/mistakes.md)). 3차 빌드 [ce934ee0](https://expo.dev/accounts/x23hash/projects/to-my-x/builds/ce934ee0-0012-4bfa-8405-7e6bd38b2e14)(develop `facb5db`, `testing` 프로필과 채널, 1.0.0 빌드 번호 3)이 성공했고 [TestFlight 제출](https://expo.dev/accounts/x23hash/projects/to-my-x/submissions/3ec11787-aab2-4b43-9173-c520bce6e376) 업로드도 성공했습니다(앱 ID `6836202739`, 제출용 API 키 유효 확인). Apple 처리 완료, 테스터 배포, 설치와 실행은 미확인입니다. | `eas build`, `eas submit` 실행 로그 | AC-04 |
| 2026-11-18 | Android 새 앱 첫 빌드 [a7f056e7](https://expo.dev/accounts/x23hash/projects/to-my-x/builds/a7f056e7-b107-489d-b1bc-684ff2053f57)(develop `facb5db`, `testing` 프로필, 1.0.0 versionCode 2, `com.x23hash.android`)이 성공했습니다. 새 패키지의 키스토어는 EAS가 비대화형 모드에서 자동으로 만들었습니다. Play 제출은 하지 않았습니다. 첫 AAB는 사용자가 Play Console에 직접 올려야 하고, 그 뒤 Play Console의 앱 무결성 화면에 나오는 업로드 키와 앱 서명 키의 SHA-1을 카카오 키 해시로 변환해 등록합니다. 설치와 실행은 미확인입니다. | `eas build` 실행 로그 | AC-03 |

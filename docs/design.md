---
name: 차록다록
description: 따뜻한 크림색 종이 위에 차를 기록하는 듯한, 손그림 감성의 귀엽고 편안한 개인 티 다이어리.

colors:
  primary: "#6F8F68"
  background: "#FFF9ED"
  surface: "#FFFFFF"
  text-primary: "#292722"
  text-secondary: "#777168"
  border: "#E9E1D4"
  green-soft: "#DCE8D5"
  orange: "#E9A15B"
  blue: "#91BFD0"
  pink: "#E9A6A6"

typography:
  heading-1:
    fontFamily: Pretendard
    fontSize: 24px
    fontWeight: 700
    lineHeight: 1.3
  heading-2:
    fontFamily: Pretendard
    fontSize: 20px
    fontWeight: 700
    lineHeight: 1.4
  title:
    fontFamily: Pretendard
    fontSize: 17px
    fontWeight: 600
    lineHeight: 1.4
  body:
    fontFamily: Pretendard
    fontSize: 15px
    fontWeight: 400
    lineHeight: 1.5
  body-sm:
    fontFamily: Pretendard
    fontSize: 13px
    fontWeight: 400
    lineHeight: 1.5
  caption:
    fontFamily: Pretendard
    fontSize: 12px
    fontWeight: 400
    lineHeight: 1.4

rounded:
  sm: 8px
  md: 12px
  lg: 16px
  full: full

spacing:
  xxs: 4px
  xs: 8px
  sm: 12px
  md: 16px
  lg: 24px
  xl: 32px

components:
  button-primary:
    backgroundColor: "{colors.primary}"
    textColor: "{colors.surface}"
    height: "약 48px"
    rounded: "{rounded.md} ~ {rounded.lg}"

  button-secondary:
    backgroundColor: "크림 또는 {colors.surface}"
    textColor: "{colors.text-primary}"
    borderColor: "{colors.border}"

  tea-record-card:
    backgroundColor: "{colors.surface}"
    borderColor: "{colors.border}"
    rounded: "{rounded.lg}"
    content: [사진, 차 이름, 종류, 날짜, 호감도]

  text-input:
    backgroundColor: "{colors.surface} 또는 아주 연한 크림"
    rounded: "{rounded.md}"
    labelPosition: 위
    focusColor: "{colors.primary}"

  flavor-chip:
    rounded: "{rounded.full}"
    defaultBackground: 연한 neutral
    selectedBackground: 부드러운 포인트 컬러
    selectedIndicator: 선택 표시

  intensity-rating:
    scale: "1~5"
    description: 향미별 강도를 빠르게 선택하는 단계형 컨트롤

  liking-rating:
    description: 향미 강도와 구분되는 개인적인 호감도 입력
    accentColor: "{colors.pink}"

  bottom-navigation:
    content: 아이콘과 짧은 텍스트 라벨
    selectedColor: "{colors.primary}"
    unselectedColor: 보조 톤
---

## Overview

차록다록은 따뜻한 크림색 종이 위에 차를 기록하는 듯한 개인 티 다이어리다.
손그림 감성의 귀엽고 편안한 분위기 속에서, 차를 마신 경험을 빠르게 기록한다.
UI는 읽기 쉽고 정돈되게 구성하고, 일러스트와 부드러운 색으로 온기를 더한다.
전통 다도나 고급 티 브랜드의 격식보다 일상적인 기록장의 친근함을 지향한다.

- 핵심 인상: 따뜻함, 편안함, 귀여움, 개인적인 기록.
- 우선순위: 가독성 → 빠른 기록 → 감성적인 장식.
- 적용 범위: 기록 작성, 기록 목록·상세, 취향 분석, 온보딩 및 빈 화면.
- Mobbin 문서는 구조와 상세도의 참고이며, 시각 스타일이나 구성 요소를 복제하지 않는다.

## 손그림 스타일 레퍼런스와 적용 방향

- 사용자 지정 레퍼런스: [Pinterest 손그림 스타일](https://kr.pinterest.com/pin/1337074887787403/).
- 디자인 의도: 위 레퍼런스와 같은 손그림 감성을 차록다록의 개인 차 시음 다이어리에 적용한다.
- 확인 상태: 링크의 원본 이미지는 현재 접근 제한으로 확인하지 못했다. 아래 지침은 사용자가 요청한 손그림 방향과 이 문서의 기존 디자인 원칙을 구체화한 것이며, 이미지의 세부 특징을 분석한 결과는 아니다.

### 표현 원칙

- 찻잔·찻잎·꽃·과일을 손으로 그린 듯한 선과 단순한 형태로 표현한다. 윤곽에는 작은 흔들림과 비대칭을 허용해 친근한 인상을 만든다.
- 색연필·크레용으로 칠한 듯한 가벼운 채색 질감과 여백을 활용한다. 크림색 바탕에 기존 그린·주황·하늘색·분홍 포인트를 연결한다.
- 손그림 표현을 일러스트, 작은 아이콘, 섹션 장식에 일관되게 적용한다. 선의 굵기와 채색 방식은 화면마다 같은 인상을 유지한다.
- 카드 주변이나 제목 옆에 작은 손그림 포인트를 배치하되, 본문·입력값·버튼 라벨은 기존 Pretendard 체계를 따른다.
- 종이 질감은 배경에서 은은하게 사용한다. 입력 영역과 분석 수치가 놓이는 면은 깨끗하게 유지하고, 화면 정렬·간격·터치 영역은 기존 규칙을 따른다.

### 핵심 화면에 적용

| 화면 | 손그림 적용 방향 |
| --- | --- |
| 기록 목록 | 제목 옆의 작은 찻잔·찻잎과 빈 목록 안내 일러스트로 다이어리 분위기를 만든다. |
| 차 기록 작성 | 향미를 연상시키는 작은 그림을 선택 항목의 보조 요소로 사용하고, 라벨과 선택 상태를 명확하게 표시한다. |
| 기록 상세 | 사용자가 남긴 사진과 시음 내용을 중심에 두고, 구분 영역 주변에 작은 손그림 장식을 더한다. |
| 내 취향 분석 | 요약과 데이터 부족 안내에 손그림을 활용한다. 차트의 축·수치·데이터 도형은 정확하게 읽히도록 정돈한다. |
| 기록 항목 설정 | 헤더의 작은 장식으로 같은 분위기를 이어가고, 표시·숨김과 순서 변경 조작은 명확하게 표현한다. |

## Colors

| 토큰 | 값 | 용도 |
| --- | --- | --- |
| `primary` | `#6F8F68` | 주요 CTA, 선택 상태, 포커스 강조 |
| `background` | `#FFF9ED` | 전체 화면의 크림색 배경 |
| `surface` | `#FFFFFF` | 카드 및 입력 영역 |
| `text-primary` | `#292722` | 제목과 기본 본문 |
| `text-secondary` | `#777168` | 날짜, 설명, 보조 정보 |
| `border` | `#E9E1D4` | 얇은 테두리와 구분선 |
| `green-soft` | `#DCE8D5` | 녹차·자연 계열의 부드러운 표현 |
| `orange` | `#E9A15B` | 따뜻한 향미·분석·일러스트 포인트 |
| `blue` | `#91BFD0` | 산뜻한 향미·분석·일러스트 포인트 |
| `pink` | `#E9A6A6` | 호감도·감성·일러스트 포인트 |

- 기능 UI는 `primary` 그린을 중심으로 통일한다.
- 나머지 포인트 컬러는 향미, 분석, 일러스트 등 표현용으로 사용한다.
- 여러 포인트 컬러를 서로 다른 CTA 배경으로 남발하지 않는다.
- 선택과 상태는 색만으로 구분하지 않고 라벨, 아이콘, 테두리를 함께 사용한다.
- 연한 포인트 배경 위 텍스트는 `text-primary`를 우선 사용한다.

## Typography

기본 폰트는 **Pretendard**이며, 사용할 수 없으면 시스템 sans-serif로 대체한다.
아래 크기는 px 단위, 행간은 글자 크기에 대한 배수다.

| 토큰 | 크기 | 굵기 | 행간 | 용도 |
| --- | ---: | ---: | ---: | --- |
| `heading-1` | 24 | 700 | 1.3 | 화면 대표 제목 |
| `heading-2` | 20 | 700 | 1.4 | 주요 섹션 제목 |
| `title` | 17 | 600 | 1.4 | 카드 제목, 차 이름 |
| `body` | 15 | 400 | 1.5 | 본문, 주요 입력 텍스트 |
| `body-sm` | 13 | 400 | 1.5 | 보조 설명, 메타 정보 |
| `caption` | 12 | 400 | 1.4 | 짧은 캡션, 부가 라벨 |

- 자간은 기본값을 사용하며, 장식 목적의 과도한 자간 조절은 피한다.
- 손글씨는 일러스트 내부나 짧은 장식 문구에만 제한한다.
- 본문, 입력값, 버튼, 내비게이션에는 읽기 쉬운 기본 폰트를 사용한다.
- 핵심 정보는 작은 캡션으로 축소하지 않고 충분한 크기와 대비를 확보한다.

## Layout & Shapes

### 간격과 형태
- Spacing 토큰: `4 / 8 / 12 / 16 / 24 / 32px`.
- 화면 좌우 기본 여백: `20px`이며, spacing 토큰과 별도로 적용한다.
- 가까운 정보는 작은 간격으로 묶고, 다른 섹션은 넓은 간격으로 구분한다.
- Radius 토큰: `8 / 12 / 16px / full`.
- 입력창은 `12px`, 일반 카드는 `16px`, 칩·태그는 `full`을 사용한다.
- 사진 모서리는 `12~16px` 범위에서 카드 구조에 맞춰 통일한다.
- 강한 shadow는 사용하지 않는다. `surface` 차이와 얇은 `border`로 계층을 표현한다.
- 손그림의 불규칙함은 장식에 적용하고, 정보 정렬과 조작 영역은 안정적으로 유지한다.

### 일러스트
- 소재: 찻잔, 찻잎, 꽃, 과일 및 향미를 연상시키는 요소.
- 표현: 조금 불규칙한 손그림 선, 종이·색연필·크레용 질감.
- 사용 위치: 빈 화면, 헤더, 온보딩, 기록 완료, 분석 요약, 작은 카드 장식.
- 크림 배경 및 포인트 컬러와 조화되는 부드러운 표현을 유지한다.
- 텍스트 뒤에 복잡한 질감을 깔거나 버튼·입력 영역을 가리지 않는다.
- 작은 화면에서는 장식보다 기록 내용과 조작 영역을 우선한다.

## Components

**`button-primary`** — Primary Button
- 주요 저장·완료 동작에 사용하며, 그린 배경과 흰색 텍스트를 기본으로 한다.
- 높이 약 `48px`, radius `12~16px`. 한 화면에서 가장 중요한 동작을 강조한다.
- 문구는 짧고 명확한 동사형으로 작성한다. 예: “기록 저장”.

**`button-secondary`** — Secondary Button
- 크림 또는 흰 배경에 진한 텍스트와 얇은 `border`를 사용한다.
- 취소·이전·보조 동작에 사용하고, 주요 버튼과 형태·높이를 일관되게 맞춘다.

**`tea-record-card`** — Tea Record Card
- 사진, 차 이름, 종류, 날짜, 호감도를 중심으로 간결하게 구성한다.
- `surface` 배경, radius `16px`, 얇은 테두리로 기록 단위를 구분한다.
- 상세 향미와 긴 메모는 상세 화면으로 넘기고, 목록에 정보를 과밀하게 넣지 않는다.

**`text-input`** — Input
- 흰색 또는 아주 연한 크림 영역을 사용하며, 라벨은 입력창 위에 배치한다.
- Radius는 `12px`. 기본 테두리는 얇게, 포커스 상태는 `primary`로 강조한다.
- 플레이스홀더로 라벨을 대체하지 않으며, 오류는 짧은 설명을 함께 표시한다.

**`flavor-chip`** — Flavor Chip
- 향미 선택용 pill 형태로, 선택 전에는 연한 neutral 표현을 사용한다.
- 선택 후에는 부드러운 포인트 배경과 선택 표시를 함께 사용한다.
- 향미 이름이 잘 읽히도록 하고, 색상마다 다른 기능적 의미를 임의로 부여하지 않는다.

**`intensity-rating`** — Intensity Rating
- 향미별 강도를 `1~5`단계로 빠르게 선택하는 컨트롤이다.
- 숫자만 작게 나열하지 않고, 단계별로 누르기 쉬운 영역과 명확한 선택 상태를 제공한다.
- 강도의 낮음·높음과 현재 선택값을 알아볼 수 있게 표시한다.

**`liking-rating`** — Liking Rating
- 향미 강도와 구분되는, 차에 대한 개인적인 호감도 입력이다.
- 짧은 라벨과 직관적인 단계 표시를 사용하고, 선택한 정도를 명확하게 보여준다.
- `pink`는 감성 포인트로 제한하며, 실제 척도와 아이콘은 화면 전반에서 통일한다.

**`bottom-navigation`** — Bottom Navigation
- 주요 화면을 오가는 하단 탐색 영역으로, 아이콘과 짧은 텍스트 라벨을 함께 사용한다.
- 선택 항목은 `primary`, 비선택 항목은 보조 톤으로 구분한다.
- 하단 안전 영역을 확보하고, 마지막 카드나 저장 버튼이 내비게이션에 가리지 않게 한다.

## Do’s and Don’ts

### Do
- 따뜻한 크림색 배경과 여유 있는 간격으로 개인 기록장 같은 인상을 만든다.
- 손그림은 필요한 곳의 작은 포인트로 활용해 친근함을 더한다.
- 짧은 문구와 간단한 선택 방식으로 빠르게 기록하고 저장할 수 있게 한다.

### Don't
- 전통 다도·한방·고급 티 브랜드처럼 무겁고 격식 있는 분위기로 만들지 않는다.
- 포인트 컬러를 CTA와 모든 컴포넌트에 남발해 기능의 우선순위를 흐리지 않는다.
- 손글씨, 질감, 장식 또는 작은 글씨를 위해 가독성과 조작 편의성을 희생하지 않는다.

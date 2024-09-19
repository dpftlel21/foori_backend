import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import {
  KAKAO_MAP_MENU_MORE_BTN,
  KAKAO_MAP_MORE_BTN,
  KAKAO_MAP_NEXT_BTN,
  KAKAO_MAP_SEARCH_INPUT_BOX,
  KAKAO_MAP_SEARCH_RESULT_ITEM,
  KAKAO_MAP_SEARCH_RESULT_ITEM_CATEGORY,
  KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_DETAIL,
  KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_NUM,
  KAKAO_MAP_SEARCH_RESULT_ITEM_MORE_VIEW_BTN,
  KAKAO_MAP_SEARCH_RESULT_ITEM_NAME,
  KAKAO_MAP_SEARCH_RESULT_LIST,
  KAKAO_MAP_SEARCH_RESULT_MENU_LIST,
  KAKAO_MAP_SEARCH_RESULT_MENU_NAME,
  KAKAO_MAP_SEARCH_RESULT_MENU_PRICE,
  KAKAO_MAP_SEARCH_RESULT_OPEN_TIME,
  KAKAO_MAP_SEARCH_RESULT_TEL_NUM,
  KAKAO_MAP_URL,
} from './const/kakao-map.const';

@Injectable()
export class CrawlService {
  async crawlKaKaoMap() {
    const url = KAKAO_MAP_URL;

    // puppeteer 브라우저 실행 (headless: true -> 브라우저 화면을 띄우지 않음)
    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(url);

    // 검색어 입력
    await page.type(KAKAO_MAP_SEARCH_INPUT_BOX, '강남역 음식점');
    await page.keyboard.press('Enter');

    console.log('검색어 입력 후 엔터');

    // 예시: 검색 결과가 나타날 때까지 대기
    await page.waitForSelector(KAKAO_MAP_SEARCH_RESULT_LIST, {
      visible: true,
    });
    console.log('검색 결과가 나타났습니다.');

    // 결과 항목 수 확인
    const results = await page.$$eval(
      KAKAO_MAP_SEARCH_RESULT_LIST,
      (items) => items.length,
    );
    console.log(`검색 결과 수: ${results}`);

    console.time('크롤링 시작');
    // 페이지 크롤링 시작
    await this.crawlAllPages(page, browser);
    console.timeEnd('크롤링 끝');

    console.log('크롤링 완료');
    await browser.close();
  }

  // 일정 시간(밀리초) 대기하는 함수
  async delay(time: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async crawlAllPages(page, browser) {
    while (true) {
      try {
        console.log('현재 페이지 크롤링 중...');
        // 페이지에 있는 모든 음식점 목록을 가져옴
        const listItems = await page.$$(KAKAO_MAP_SEARCH_RESULT_ITEM);

        if (listItems.length === 0) {
          console.log('리스트가 비어 있습니다.');
          break; // 크롤링 종료 조건
        }

        console.log('listItems', listItems.length);

        // 각 음식점에 대해 세부 정보 크롤링 수행
        for (const element of listItems) {
          const moreView = await element.$(
            KAKAO_MAP_SEARCH_RESULT_ITEM_MORE_VIEW_BTN,
          );

          if (moreView) {
            console.log('더보기 버튼 클릭');
            const moreViewHref = await moreView.evaluate((el) => el.href);
            console.log(`상세보기 링크: ${moreViewHref}`);

            // 새 탭 대신 해당 링크로 이동
            const newPage = await browser.newPage();
            await newPage.goto(moreViewHref, { waitUntil: 'networkidle0' });
            console.log('상세보기 페이지로 이동했습니다.');

            // 새 페이지에서 크롤링 작업 수행
            await this.getAttr(newPage);

            // 새 탭 닫기
            await newPage.close();

            // 원래 페이지로 전환
            await page.bringToFront();
          }
        }

        // 더보기 버튼을 찾음
        const moreButton = await page.$(KAKAO_MAP_MORE_BTN);
        const isMoreButtonVisible = moreButton
          ? await page.evaluate(
              (button) => !button.classList.contains('HIDDEN'),
              moreButton,
            )
          : false;

        if (isMoreButtonVisible) {
          // 더보기 버튼이 보이는 경우 더보기 버튼을 클릭
          await page.evaluate((button) => {
            button.click();
          }, moreButton);

          await this.delay(5000); // 5초 대기
          console.log('더보기 버튼을 클릭했습니다.');
        }

        // 더보기 버튼을 클릭한 후, 또는 더보기 버튼이 없는 경우 다음 페이지로 이동
        const nextButton = await page.$(KAKAO_MAP_NEXT_BTN);
        if (nextButton) {
          await page.evaluate((button) => {
            button.click();
          }, nextButton);

          await this.delay(5000); // 5초 대기
          console.log('다음 페이지로 이동했습니다.');
        } else {
          console.log('더 이상 클릭할 버튼이 없습니다.');
          break; // 더 이상 다음 페이지나 더보기가 없으면 종료
        }
      } catch (e) {
        console.error('크롤링 중 오류 발생:', e);
        break;
      }
    }
  }

  // 세부 정보 크롤링 함수
  async getAttr(page) {
    try {
      // 음식점 이름
      const placeName = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_NAME,
        (el) => el.textContent.trim(),
      );

      // 카테고리
      const placeCategory = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_CATEGORY,
        (el) => el.textContent.trim(),
      );

      // 위치 세부 정보
      const locationDetail = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_DETAIL,
        (el) => el.textContent.trim(),
      );

      const locationNum = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_NUM,
        (el) => el.textContent.trim(),
      );

      const openTime = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_OPEN_TIME,
        (el) => el.textContent.trim(),
      );

      const placeTelNum = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_TEL_NUM,
        (el) => el.textContent.trim(),
      );

      const moreMenuBtn = await page.$(KAKAO_MAP_MENU_MORE_BTN);
      if (moreMenuBtn) {
        await page.evaluate((button) => {
          button.click();
        }, moreMenuBtn);

        await this.delay(5000); // 5초 대기
      }

      const listItems = await page.$$(KAKAO_MAP_SEARCH_RESULT_MENU_LIST);
      const menuMap = new Map();

      if (listItems.length !== 0) {
        console.log('listItems', listItems.length);

        // 각 li 항목을 순회하며 메뉴 정보 추출
        for (let i = 0; i < listItems.length; i++) {
          const menuName = await listItems[i].$eval(
            KAKAO_MAP_SEARCH_RESULT_MENU_NAME, // span 태그 선택
            (el) => el.textContent.trim(),
          );

          const menuPrice = await listItems[i].$eval(
            KAKAO_MAP_SEARCH_RESULT_MENU_PRICE, // em.price_menu 태그 선택
            (el) => el.textContent.trim(),
          );

          menuMap.set(menuName, menuPrice); // Map에 메뉴 이름과 가격 저장
        }
      } else {
        console.log('리스트가 비어 있습니다.');
      }

      console.log('=====================');
      console.log(`음식점 이름: ${placeName}`);
      console.log(`카테고리: ${placeCategory}`);
      console.log(`위치 상세: ${locationDetail}`);
      console.log(`위치 번호: ${locationNum}`);
      console.log(`영업 시간: ${openTime}`);
      console.log(`전화번호: ${placeTelNum}`);
      console.log(' ----- 메뉴 정보 -----');
      menuMap.forEach((price, name) => {
        console.log(`메뉴: ${name}, ${price}`);
      });
      // console.log(' ----- 좌     표 ----- ');
      // console.log(`x좌표: ${place.x}`);
      // console.log(`y좌표: ${place.y}`);
      // console.log(`lon?: ${place.lon}`);
      // console.log(`lat?: ${place.lat}`);
      // console.log(`place: ${place}`);
      console.log('=====================');
    } catch (e) {
      console.error('세부 정보 크롤링 중 오류 발생:', e);
    }
  }
}

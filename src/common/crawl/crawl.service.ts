// src/crawl.service.ts
import { Injectable } from '@nestjs/common';
import puppeteer from 'puppeteer';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { RestaurantEntity } from '../../place/entities/restaurant.entity';
import { MenuEntity } from '../../menus/entities/menu.entity';
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
  KAKAO_MAP_SEARCH_RESULT_PAGE_NUM,
  KAKAO_MAP_SEARCH_RESULT_TEL_NUM,
  KAKAO_MAP_URL,
} from './const/kakao-map.const';

@Injectable()
export class CrawlService {
  constructor(
    @InjectRepository(RestaurantEntity)
    private restaurantRepository: Repository<RestaurantEntity>,
    @InjectRepository(MenuEntity)
    private menuRepository: Repository<MenuEntity>,
  ) {}

  async crawlKaKaoMap() {
    const url = KAKAO_MAP_URL;

    const browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });

    const page = await browser.newPage();
    page.setDefaultTimeout(30000);
    await page.goto(url);

    await page.type(KAKAO_MAP_SEARCH_INPUT_BOX, '강남역 음식점');
    await page.keyboard.press('Enter');

    console.log('검색어 입력 후 엔터');

    await page.waitForSelector(KAKAO_MAP_SEARCH_RESULT_LIST, {
      visible: true,
    });
    console.log('검색 결과가 나타났습니다.');

    console.time('크롤링 시작');
    await this.crawlAllPages(page, browser);
    console.timeEnd('크롤링 끝');

    console.log('크롤링 완료');
    await browser.close();
  }

  async delay(time: number) {
    return new Promise(function (resolve) {
      setTimeout(resolve, time);
    });
  }

  async crawlAllPages(page, browser) {
    while (true) {
      try {
        console.log('현재 페이지 크롤링 중...');
        const listItems = await page.$$(KAKAO_MAP_SEARCH_RESULT_ITEM);

        if (listItems.length === 0) {
          console.log('리스트가 비어 있습니다.');
          break; // 크롤링 종료 조건
        }

        console.log('listItems', listItems.length);

        for (const element of listItems) {
          const moreView = await element.$(
            KAKAO_MAP_SEARCH_RESULT_ITEM_MORE_VIEW_BTN,
          );

          if (moreView) {
            console.log('더보기 버튼 클릭');
            const moreViewHref = await moreView.evaluate((el) => el.href);
            console.log(`상세보기 링크: ${moreViewHref}`);

            const newPage = await browser.newPage();
            await newPage.goto(moreViewHref, { waitUntil: 'networkidle0' });
            console.log('상세보기 페이지로 이동했습니다.');

            const attrData = await this.getAttr(newPage);
            await this.saveCrawledData(attrData);

            await newPage.close();
            await page.bringToFront();
          }
        }

        // 페이지 이동 및 "더보기" 버튼 처리
        const shouldContinue = await this.handlePagination(page);
        if (!shouldContinue) {
          break; // 더 이상 이동할 페이지가 없으면 종료
        }
      } catch (e) {
        console.error('크롤링 중 오류 발생:', e);
        break;
      }
    }
  }

  // 페이지 이동 및 "더보기" 버튼 처리 함수
  private async handlePagination(page): Promise<boolean> {
    try {
      const moreButton = await page.$(KAKAO_MAP_MORE_BTN);
      const nextButton = await page.$(KAKAO_MAP_NEXT_BTN);
      const pageButtons = await page.$$(KAKAO_MAP_SEARCH_RESULT_PAGE_NUM);

      // 더보기 버튼이 화면에 표시되고 있는지 확인하고 클릭
      if (moreButton) {
        const isMoreButtonVisible = await page.evaluate(
          (button) =>
            button.offsetParent !== null &&
            !button.classList.contains('HIDDEN'),
          moreButton,
        );

        if (isMoreButtonVisible) {
          console.log('========= 더보기 버튼 클릭 ===============');
          await page.evaluate((button) => {
            button.click();
          }, moreButton);
          await this.delay(5000); // 클릭 후 충분히 대기
          return true; // 더보기 버튼을 클릭한 후 즉시 종료
        }
      }

      // 페이지 버튼이 없는 경우 확인
      if (pageButtons.length === 0) {
        console.log('페이지 버튼이 존재하지 않습니다.');
        return false; // 페이지 버튼이 없으면 종료
      }

      // 현재 페이지 번호 확인
      const currentPageNumber = await this.getCurrentPageNumber(
        page,
        pageButtons,
      );
      console.log(`현재 페이지 번호: ${currentPageNumber}`);
      const lastPageNumber = pageButtons.length;

      // 다음 페이지 클릭 로직
      if (currentPageNumber === lastPageNumber) {
        console.log('========= 다음 버튼 클릭 ===============');
        if (nextButton) {
          await page.evaluate((btn) => {
            btn.scrollIntoView({ block: 'center' });
            btn.click();
          }, nextButton);
          await this.delay(5000);
          return true;
        } else {
          console.log('더 이상 클릭할 다음 버튼이 없습니다.');
          return false;
        }
      } else if (currentPageNumber < lastPageNumber) {
        console.log('========= 다음 페이지 버튼 클릭 ===============');
        const nextPageButton = pageButtons[currentPageNumber];
        try {
          // 페이지 번호 버튼을 강제로 클릭
          await page.evaluate((btn) => {
            btn.scrollIntoView({ block: 'center' });
            btn.click();
          }, nextPageButton);
          await this.delay(5000);
          return true;
        } catch (error) {
          console.error('다음 페이지 버튼 클릭 중 오류:', error);
          return false;
        }
      }

      return false;
    } catch (error) {
      console.error('페이지 이동 중 오류 발생:', error);
      return false;
    }
  }

  // 현재 페이지 번호를 가져오는 함수
  private async getCurrentPageNumber(page, pageButtons): Promise<number> {
    let currentPageNumber = 0;

    try {
      for (let i = 0; i < pageButtons.length; i++) {
        const className = await pageButtons[i].evaluate((btn) => btn.className);

        // 활성화된 페이지 버튼을 찾기 위해 유연한 조건 추가
        if (className === 'ACTIVE') {
          currentPageNumber = i + 1; // 페이지 번호는 1부터 시작한다고 가정
          break;
        }
      }

      // 페이지 번호를 찾지 못한 경우 로그
      if (currentPageNumber === 0) {
        console.log('활성화된 페이지 번호를 찾지 못했습니다.');
      }
    } catch (error) {
      console.error('현재 페이지 번호를 가져오는 중 오류 발생:', error);
    }

    return currentPageNumber;
  }

  // 세부 정보 크롤링 함수 - openTime을 openDays, openTime, closeTime로 분리
  async getAttr(page): Promise<any> {
    try {
      const placeName = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_NAME,
        (el) => el.textContent.trim(),
      );

      // '분류: '를 제외하고 저장
      const placeCategory = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_CATEGORY,
        (el) => el.textContent.trim().replace(/^분류:\s*/, ''),
      );

      const locationDetail = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_DETAIL,
        (el) => el.innerText.replace(/\s+/g, ' ').trim(), // 줄바꿈과 불필요한 공백을 하나의 공백으로 정리
      );

      // 우편번호 분리 로직
      const postalCodePattern = /\(우\)\s*(\d{5})$/; // "(우) 숫자 5자리" 형태의 우편번호를 찾는 정규식
      let postalCode = '';
      let address = locationDetail;

      // 우편번호가 존재하면 분리
      const postalCodeMatch = locationDetail.match(postalCodePattern);
      if (postalCodeMatch) {
        postalCode = postalCodeMatch[1]; // 우편번호만 추출
        address = locationDetail.replace(postalCodePattern, '').trim(); // 우편번호를 제외한 주소
      }

      // '지번'을 제외하고 저장
      const locationNum = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_ITEM_LOCATION_NUM,
        (el) => el.textContent.trim().replace(/^지번\s*/, ''),
      );

      const openTimeOrigin = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_OPEN_TIME,
        (el) => el.textContent.trim(),
      );

      const placeTelNum = await page.$eval(
        KAKAO_MAP_SEARCH_RESULT_TEL_NUM,
        (el) => el.textContent.trim(),
      );

      // openTime을 파싱하여 openDays, openTime, closeTime으로 분리
      const { openDays, openTime, closeTime } =
        this.parseOpenTime(openTimeOrigin);

      const moreMenuBtn = await page.$(KAKAO_MAP_MENU_MORE_BTN);
      if (moreMenuBtn) {
        await page.evaluate((button) => {
          button.click();
        }, moreMenuBtn);

        await this.delay(5000);
      }

      const listItems = await page.$$(KAKAO_MAP_SEARCH_RESULT_MENU_LIST);
      const menus = [];

      if (listItems.length !== 0) {
        console.log('listItems', listItems.length);

        for (let i = 0; i < listItems.length; i++) {
          const menuName = await listItems[i].$eval(
            KAKAO_MAP_SEARCH_RESULT_MENU_NAME,
            (el) => el.textContent.trim(),
          );

          const menuPrice = await listItems[i].$eval(
            KAKAO_MAP_SEARCH_RESULT_MENU_PRICE,
            (el) =>
              el.textContent
                .trim()
                .replace(/^가격:\s*/, '')
                .replace(/,/g, ''), // '가격: ' 제거 및 쉼표 제거
          );

          const parsedPrice = parseInt(menuPrice, 10); // 문자열을 정수로 변환

          menus.push({ name: menuName, price: parsedPrice });
        }
      }

      return {
        placeName,
        placeCategory,
        address,
        postalCode,
        locationNum,
        openDays,
        openTime,
        closeTime,
        placeTelNum,
        menus,
      };
    } catch (e) {
      console.error('세부 정보 크롤링 중 오류 발생:', e);
      return null;
    }
  }

  private parseOpenTime(openTimeOrigin: string) {
    let openDays: string[] = [];
    let openTime = '';
    let closeTime = '';

    // 요일과 시간대를 분리하기 위한 정규식
    const regex = /([가-힣,~\s]+)\s*([\d:]+)\s*~\s*([\d:]+)/;
    const match = openTimeOrigin.match(regex);

    if (match) {
      openDays = this.parseDays(match[1].trim()); // 요일 부분을 처리하여 배열로 변환
      openTime = match[2] || ''; // 오픈 시간, 값이 없을 경우 빈 문자열
      closeTime = match[3] || ''; // 마감 시간, 값이 없을 경우 빈 문자열
    } else {
      console.warn(`시간 형식을 파싱할 수 없습니다: ${openTimeOrigin}`);
      openDays = []; // 빈 배열 설정
      openTime = ''; // 기본 빈 문자열 설정
      closeTime = ''; // 기본 빈 문자열 설정
    }

    return { openDays, openTime, closeTime };
  }

  // 요일을 배열로 변환하는 함수
  private parseDays(dayString: string): string[] {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];

    // 매일의 경우 모든 요일 반환
    if (dayString === '매일') {
      return [...weekDays];
    }

    // 요일 범위 처리 (예: "화~토")
    if (dayString.includes('~')) {
      const [startDay, endDay] = dayString.split('~').map((d) => d.trim());
      return this.getDaysInRange(startDay, endDay);
    }

    // 개별 요일 목록 처리 (예: "월,수,목")
    return dayString.split(',').map((d) => d.trim());
  }

  // 요일 범위를 배열로 반환하는 함수 (예: 화~토 -> [화, 수, 목, 금, 토])
  private getDaysInRange(startDay: string, endDay: string): string[] {
    const weekDays = ['월', '화', '수', '목', '금', '토', '일'];
    const startIndex = weekDays.indexOf(startDay);
    const endIndex = weekDays.indexOf(endDay);

    // 범위가 올바르지 않거나 예외 처리
    if (startIndex === -1 || endIndex === -1 || startIndex > endIndex) {
      console.warn(`요일 범위를 처리할 수 없습니다: ${startDay}~${endDay}`);
      return [];
    }

    return weekDays.slice(startIndex, endIndex + 1);
  }

  // 크롤링 데이터를 DB에 저장하는 함수 수정
  async saveCrawledData(data: any) {
    if (!data) {
      console.log('저장할 데이터가 없습니다.');
      return;
    }

    try {
      const {
        placeName,
        placeCategory,
        address,
        locationNum,
        postalCode,
        openDays,
        openTime,
        closeTime,
        placeTelNum,
        menus,
      } = data;

      // TIME 형식으로 변환
      const formattedOpenTime = openTime
        ? this.formatTime(openTime)
        : '00:00:00';
      const formattedCloseTime = closeTime
        ? this.formatTime(closeTime)
        : '00:00:00';

      const openDaysString = openDays.length ? openDays.join(',') : '미정';

      const restaurant = this.restaurantRepository.create({
        name: placeName,
        category: placeCategory,
        address,
        locationNum,
        postalCode,
        openDays: openDaysString,
        openTime: formattedOpenTime, // TIME 형식으로 변환된 값 저장
        closeTime: formattedCloseTime, // TIME 형식으로 변환된 값 저장
        telNum: placeTelNum,
        menus: menus.map((menu) => this.menuRepository.create(menu)),
      });

      await this.restaurantRepository.save(restaurant);
      console.log(`음식점 ${placeName}이(가) 데이터베이스에 저장되었습니다.`);
    } catch (e) {
      console.error('데이터 저장 중 오류 발생:', e);
    }
  }

  // 시간 형식 변환 함수
  private formatTime(timeString: string): string {
    // HH:MM 형식을 HH:MM:SS로 변환하여 반환
    const [hour, minute] = timeString.split(':');
    return `${hour.padStart(2, '0')}:${minute.padStart(2, '0')}:00`;
  }
}

import * as _ from "lodash";
import { Restaurant, FoodItem, RestaurantDayMenu, WeekDay } from "../types";

export const url = "https://schnitzelplatz.se/lunch/";

const firstPartOfSplitOrAll = (str: string, split: string): string => {
  const parts = str.split(split);
  if (parts && parts.length > 1) {
    return parts[0];
  } else {
    return str;
  }
};

export const parseHtml = ($: CheerioStatic): Restaurant => {
  const menus = $(".foodmenu h4")
    .get()
    .map(node => [
      $(node).text().trim(),
      firstPartOfSplitOrAll(
        $(node)
          .next("p")
          .text(),
        "\n"
      )
    ]);

  const numWeekItems = menus.length - 5;

  const weekItems: FoodItem[] = _.take(menus, numWeekItems).map(
    ([title, name]) => ({
      title: title.toUpperCase(),
      name
    })
  );
  const dayItems = _.drop(menus, numWeekItems);

  const days: RestaurantDayMenu[] = dayItems.map(([day, name]) => ({
    wday: day as WeekDay,
    items: [{ name }].concat(weekItems)
  }));

  return { name: "Schnitzelplatz Lagerhuset", url, days };
};

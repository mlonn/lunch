import { RestaurantData, Item } from "./bankok_types";
import { RestaurantDayMenu, WeekDay, FoodItem, Restaurant } from "../types";
import { groupBy, startCase, take } from "lodash";
import { filterMap, mapDayNameToWeekDay } from "../lib/utils";

const QUERY = `
query Query($clientId: String!) {
    items(clientId: $clientId) {
      id
      name
      preview
      info
      description
      outOfStock
      sortOrder
      category
      additionalItems {
        name
    }
    ingestions {
        price
        type
    }
    itemCategory
  }
  itemCategories(clientId: $clientId) {
      id
      name
      preview
      description
      category
  }
}
`;

const CLIENT_ID = "5c0644cbfd30240bfdb26765";

export const url = "https://www.bkgbg.se/lunch";

export const fetchMeals = (): Promise<RestaurantData> =>
  fetch("https://secure.paidit.se/graphql", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      query: QUERY,
      variables: { clientId: CLIENT_ID },
      operationName: "Query"
    })
  })
    .then(r => r.json())
    .then(r => r.data);

const transformToFoodItem = (item: Item): FoodItem => {
  const isVegetarian = item.description.match(/VEGETARISK/);

  return {
    name: item.description
      .replace(/\(?VEGETARISK\)? ?/, "")
      .replace(/ \./g, "."),
    title: item.name.substring(0, 1) + (isVegetarian ? " — VEGETARISK" : "")
  };
};

const groupMeals = (data: RestaurantData): RestaurantDayMenu[] => {
  const itemsByItemCategory = groupBy(data.items, item => item.itemCategory);

  const days = data.itemCategories.filter(category =>
    category.name.toLowerCase().includes("lunch")
  );

  return filterMap(days, day => {
    const dayName = mapDayNameToWeekDay(day.name);

    if (!dayName) {
      return null;
    }

    return {
      items: take(itemsByItemCategory[day.id], 5).map(transformToFoodItem),
      wday: dayName
    };
  });
};

export const parseResponse = (restaurantData: RestaurantData): Restaurant => ({
  name: "Bankok Kitchen",
  url,
  days: groupMeals(restaurantData)
});

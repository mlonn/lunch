import "isomorphic-unfetch";
import * as cheerio from "cheerio";

import {
  url as seasideUrl,
  parseHtml as parseSeaside
} from "./restaurants/seaside";
import { url as hopsUrl, parseHtml as parseHops } from "./restaurants/hops";
import {
  url as barabicuUrl,
  parseHtml as parseBarabicu
} from "./restaurants/barabicu";
import {
  url as schnitzelplatzUrl,
  parseHtml as parseSchnitzelplatz
} from "./restaurants/schnitzelplatz";
import { Restaurant } from "./types";
import {
  fetchMeals,
  parseResponse as parseBankok,
  url as bankokUrl
} from "./restaurants/bankok";

const getEmptyRestaurantFallback = (name: string, url: string) => (
  error: Error
) => {
  console.log(`Error fetching ${name}:`, error);
  return {
    name,
    url,
    days: []
  };
};

const fetchHTML = (url: string) =>
  fetch(url)
    .then(r => r.text())
    .then(r => cheerio.load(r));

const getAllRestaurants = (): Promise<Restaurant[]> => {
  const hops = fetchHTML(hopsUrl)
    .then(parseHops)
    .catch(getEmptyRestaurantFallback("Hops", hopsUrl));
  const seaside = fetchHTML(seasideUrl)
    .then(parseSeaside)
    .catch(getEmptyRestaurantFallback("Seaside", seasideUrl));
  const schnitzelplatz = fetchHTML(schnitzelplatzUrl)
    .then(parseSchnitzelplatz)
    .catch(
      getEmptyRestaurantFallback("Schnitzelplatz Lagerhuset", schnitzelplatzUrl)
    );
  const barabicu = fetchHTML(barabicuUrl)
    .then(parseBarabicu)
    .catch(getEmptyRestaurantFallback("Barabicu", barabicuUrl));

  const bankok = fetchMeals()
    .then(parseBankok)
    .catch(getEmptyRestaurantFallback("Bankok Kitchen", bankokUrl));

  return Promise.all([hops, seaside, schnitzelplatz, barabicu, bankok]);
};

export const fetchAll = (): Promise<Restaurant[]> => {
  return getAllRestaurants();
};

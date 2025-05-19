import OPENCAGE_API_KEY from './api-credentials.js';
/**
 * Reverse geocode GPS coords to city and country.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<{city: string|null, country: string|null}>}
 */
export async function reverseGeocode(lat, lon) {
  if (typeof lat !== 'number' || typeof lon !== 'number') {
    return { localized: null, country: null };
  }

  const url = `https://api.opencagedata.com/geocode/v1/json?q=${lat}+${lon}&key=${OPENCAGE_API_KEY}&no_annotations=1&language=en`;

  try {
    const response = await fetch(url);
    const data = await response.json();

    if (data.results && data.results.length > 0) {
      const components = data.results[0].components;
      return {
        localized:
          components.city ||
          components.town ||
          components.village ||
          components.hamlet ||
          components.county ||
          components.state_district ||
          components.suburb ||
          null,
        country: components.country || null,
      };
    }
  } catch (error) {
    console.warn('OpenCage geocoding error:', error);
  }

  return { localized: null, country: null };
}
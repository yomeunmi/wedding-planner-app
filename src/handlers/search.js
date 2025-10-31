const { getItemsByCategory } = require('../utils/dynamodb');
const { success, error } = require('../utils/response');
const { CATEGORIES } = require('../config/constants');

/**
 * 웨딩홀 검색 API
 */
module.exports.weddingHalls = async (event) => {
  try {
    const { limit = 50 } = event.queryStringParameters || {};

    const items = await getItemsByCategory(
      CATEGORIES.WEDDING_HALL,
      parseInt(limit)
    );

    return success({
      category: 'wedding-halls',
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching wedding halls:', err);
    return error('Failed to fetch wedding halls');
  }
};

/**
 * 스튜디오 검색 API
 */
module.exports.studios = async (event) => {
  try {
    const { limit = 50 } = event.queryStringParameters || {};

    const items = await getItemsByCategory(
      CATEGORIES.STUDIO,
      parseInt(limit)
    );

    return success({
      category: 'studios',
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching studios:', err);
    return error('Failed to fetch studios');
  }
};

/**
 * 드레스샵 검색 API
 */
module.exports.dress = async (event) => {
  try {
    const { limit = 50 } = event.queryStringParameters || {};

    const items = await getItemsByCategory(
      CATEGORIES.DRESS,
      parseInt(limit)
    );

    return success({
      category: 'dress-shops',
      count: items.length,
      items
    });
  } catch (err) {
    console.error('Error fetching dress shops:', err);
    return error('Failed to fetch dress shops');
  }
};

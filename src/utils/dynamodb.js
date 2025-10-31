const AWS = require('aws-sdk');
const { TABLE_NAME } = require('../config/constants');

const dynamoDB = new AWS.DynamoDB.DocumentClient();

/**
 * 아이템 저장
 */
const putItem = async (item) => {
  const params = {
    TableName: TABLE_NAME,
    Item: {
      ...item,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    }
  };

  return dynamoDB.put(params).promise();
};

/**
 * 카테고리별 아이템 조회
 */
const getItemsByCategory = async (category, limit = 50) => {
  const params = {
    TableName: TABLE_NAME,
    IndexName: 'category-index',
    KeyConditionExpression: 'category = :category',
    ExpressionAttributeValues: {
      ':category': category
    },
    Limit: limit,
    ScanIndexForward: false // 최신순 정렬
  };

  const result = await dynamoDB.query(params).promise();
  return result.Items;
};

/**
 * 단일 아이템 조회
 */
const getItem = async (pk, sk) => {
  const params = {
    TableName: TABLE_NAME,
    Key: { pk, sk }
  };

  const result = await dynamoDB.get(params).promise();
  return result.Item;
};

/**
 * 일괄 저장
 */
const batchWrite = async (items) => {
  const chunks = [];
  const chunkSize = 25; // DynamoDB batch write 제한

  for (let i = 0; i < items.length; i += chunkSize) {
    chunks.push(items.slice(i, i + chunkSize));
  }

  const promises = chunks.map(chunk => {
    const params = {
      RequestItems: {
        [TABLE_NAME]: chunk.map(item => ({
          PutRequest: {
            Item: {
              ...item,
              createdAt: new Date().toISOString(),
              updatedAt: new Date().toISOString()
            }
          }
        }))
      }
    };
    return dynamoDB.batchWrite(params).promise();
  });

  return Promise.all(promises);
};

module.exports = {
  putItem,
  getItem,
  getItemsByCategory,
  batchWrite
};

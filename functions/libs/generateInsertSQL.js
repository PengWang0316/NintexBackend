const { format } = require('@kevinwang0316/mysql-helper');

module.exports = (insertSQL, dataSet, table, userId) => {
  let queries = '';
  dataSet.forEach((data) => {
    data.push(userId);
    queries += `${format(insertSQL, [table, data])};`;
  });
  return queries;
};

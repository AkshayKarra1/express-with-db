export const handler = async (event) => {
  // TODO implement
  const keyword = event.queryStringParameters.keyword;
  const response = `AKSHAY says ${keyword}`;

  return {
    statusCode: 200,
    headers: {
      "Content-Type": "text/plain",
    },
    body: response,
  };
};

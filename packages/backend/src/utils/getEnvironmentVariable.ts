export const getEnvironmentVariable = (key: string) => {
  const variableValue = process.env[key];
  if (variableValue == null) {
    throw new Error(`environment variable ${key} is null`);
  }
  return variableValue;
};

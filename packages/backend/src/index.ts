import { Comprehend } from 'aws-sdk';
import type {
  APIGatewayProxyEventV2,
  APIGatewayProxyResultV2,
} from 'aws-lambda';
import { badRequest, internalServerError } from './response';
import { getEnvironmentVariable } from './utils/getEnvironmentVariable';

type SyntaxHighlightedText = {
  id: number;
  text: string;
  tag: string;
};

const region = getEnvironmentVariable('AWS_REGION');
const lowerLimitScore = Number(getEnvironmentVariable('LOWER_LIMIT_SCORE'));
if (isNaN(lowerLimitScore)) {
  throw new Error(
    `environment variable LOWER_LIMIT_SCORE cannot be converted number type`
  );
}

const comprehend = new Comprehend({ region });

const getTag = ({
  tag,
  score,
}: {
  readonly tag?: string;
  readonly score?: number;
}) => {
  if (tag == null || score == null) {
    return 'UNKNOWN';
  }
  if (score < lowerLimitScore) {
    return 'UNKNOWN';
  }
  return tag;
};

const getSyntaxTokenList = async (text: string) => {
  const res = await comprehend
    .detectSyntax({
      LanguageCode: 'en',
      Text: text,
    })
    .promise()
    .catch((err: Error) => err);

  if (res instanceof Error) {
    return res;
  }

  if (res.SyntaxTokens == null) {
    return new Error('response of AWS Comprehend is null');
  }

  return res.SyntaxTokens;
};

const getText = (event: APIGatewayProxyEventV2) => {
  if (event.queryStringParameters == null) {
    return new Error('query string is null');
  }

  if (event.queryStringParameters.text == null) {
    return new Error('query string text is null');
  }

  return event.queryStringParameters.text;
};

export const handler = async (
  event: APIGatewayProxyEventV2
): Promise<APIGatewayProxyResultV2> => {
  console.log('event', event);

  const text = getText(event);
  if (text instanceof Error) {
    console.error(text);
    return badRequest(text.message);
  }

  const syntaxTokenList = await getSyntaxTokenList(text);
  if (syntaxTokenList instanceof Error) {
    console.error(syntaxTokenList);
    return internalServerError();
  }

  const syntaxHighlightedTexts = syntaxTokenList.reduce(
    (
      accumulator: SyntaxHighlightedText[],
      { TokenId: id, Text: text, PartOfSpeech: partOfSpeech }
    ) => {
      if (id != null && text != null && partOfSpeech != null) {
        const currentValue: SyntaxHighlightedText = {
          id,
          text,
          tag: getTag({ tag: partOfSpeech.Tag, score: partOfSpeech.Score }),
        };
        accumulator.push(currentValue);
      }
      return accumulator;
    },
    []
  );

  return {
    statusCode: 200,
    body: JSON.stringify(syntaxHighlightedTexts),
  };
};

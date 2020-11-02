import * as React from 'react';
import {
  Button,
  createStyles,
  Grid,
  makeStyles,
  Paper,
  TextField,
  Theme,
} from '@material-ui/core';

type Tag =
  | 'ADJ'
  | 'ADP'
  | 'ADV'
  | 'AUX'
  | 'CONJ'
  | 'CCONJ'
  | 'DET'
  | 'INTJ'
  | 'NOUN'
  | 'NUM'
  | 'Other'
  | 'PART'
  | 'PRON'
  | 'PROPN'
  | 'PUNCT'
  | 'SCONJ'
  | 'SYM'
  | 'VERB'
  | 'UNKNOWN';

type OutputData = {
  id: number;
  text: string;
  tag: Tag;
};

type Colors = {
  [key in Tag]: {
    colorForDark: string;
    description: string;
    descriptionJP: string;
  };
};

const colors: Colors = {
  NOUN: {
    colorForDark: '#f99157',
    description: 'Noun',
    descriptionJP: '名詞',
  },
  PRON: {
    colorForDark: '#ffd5be',
    description: 'Pronoun',
    descriptionJP: '代名詞',
  },
  PROPN: {
    colorForDark: '#ff6f22',
    description: 'Proper noun',
    descriptionJP: '固有名詞',
  },
  VERB: {
    colorForDark: '#cc99cc',
    description: 'Verb',
    descriptionJP: '動詞',
  },
  AUX: {
    colorForDark: '#b05657',
    description: 'Auxiliary',
    descriptionJP: '助動詞',
  },
  ADP: {
    colorForDark: '#ffcc66',
    description: 'Adposition',
    descriptionJP: '接置詞',
  },
  DET: {
    colorForDark: '#99cc99',
    description: 'Determiner',
    descriptionJP: '限定詞',
  },
  ADV: {
    colorForDark: '#f2777a',
    description: 'Adverb',
    descriptionJP: '副詞',
  },
  ADJ: {
    colorForDark: '#6699cc',
    description: 'Adjective',
    descriptionJP: '形容詞',
  },
  CONJ: {
    colorForDark: '#d27b53',
    description: 'Conjunction',
    descriptionJP: '接続詞',
  },
  CCONJ: {
    colorForDark: '#d27b53',
    description: 'Coordinating conjunction',
    descriptionJP: '等位接続詞',
  },
  SCONJ: {
    colorForDark: '#d27b53',
    description: 'Subordinating conjunction',
    descriptionJP: '従属接続詞',
  },
  INTJ: {
    colorForDark: '#66cccc',
    description: 'Interjection',
    descriptionJP: '間投詞',
  },
  PART: {
    colorForDark: '#6699cc',
    description: 'Particle',
    descriptionJP: '不変化詞、小詞、接頭辞',
  },
  PUNCT: {
    colorForDark: '#f2f0ec',
    description: 'Punctuation',
    descriptionJP: '句読点',
  },
  NUM: {
    colorForDark: '#ffffff',
    description: 'Number',
    descriptionJP: '数値',
  },
  Other: {
    colorForDark: '#ffffff',
    description: 'Other',
    descriptionJP: 'その他',
  },
  SYM: {
    colorForDark: '#ffffff',
    description: 'Symbol',
    descriptionJP: '記号',
  },
  UNKNOWN: {
    colorForDark: '#ffffff',
    description: 'Unknown',
    descriptionJP: '不明',
  },
};

const getColorForDark = (tag: Tag) => colors[tag].colorForDark;

const useStyles = makeStyles((theme: Theme) =>
  createStyles({
    root: {
      flexGrow: 1,
    },
    input: {
      padding: theme.spacing(2),
    },
    output: {
      padding: theme.spacing(2),
      height: '100%',
      backgroundColor: '#2d2d2d',
      fontSize: 'large',
    },
  })
);
export const SyntaxHighLight = () => {
  const [inputText, setInputText] = React.useState<string>('');
  const [outputText, setOutputText] = React.useState<React.ReactNode>(<span />);

  const handleChange = React.useCallback(
    (event: React.ChangeEvent<HTMLInputElement>) => {
      setInputText(event.target.value);
    },
    [setInputText]
  );

  const handleSubmit = React.useCallback(
    async (event: React.FormEvent<HTMLFormElement>) => {
      event.preventDefault();
      const qs = new URLSearchParams({
        text: inputText,
      });
      const res = await fetch(
        `${process.env.REACT_APP_API_URL}/syntax-highlighted-text?${qs}`,
        {
          method: 'GET',
          mode: 'cors',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );
      if (!res.ok) {
        console.error(res);
        return;
      }
      const json = await res.json();
      setOutputText(
        json.map((value: OutputData) => (
          <span
            key={value.id}
            className={value.tag}
            style={{ color: getColorForDark(value.tag) }}
          >
            {value.text}{' '}
          </span>
        ))
      );
    },
    [inputText]
  );

  const classes = useStyles();

  return (
    <>
      <div className={classes.root}>
        <h1>自然言語シンタックスハイライト（英語）</h1>
        <form onSubmit={handleSubmit} noValidate autoComplete="off">
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Paper className={classes.input}>
                <TextField
                  name="input"
                  label="インプット"
                  multiline
                  rows={10}
                  variant="outlined"
                  fullWidth
                  value={inputText}
                  onChange={handleChange}
                />
              </Paper>
            </Grid>
            <Grid item xs={6}>
              <Paper className={classes.output}>{outputText}</Paper>
            </Grid>
            <Grid item xs={12}>
              <Paper className={classes.output}>
                {Object.entries(colors).map(([key, value]) => (
                  <span key={key} style={{ color: value.colorForDark }}>
                    {value.description} : {value.descriptionJP}
                    <br />
                  </span>
                ))}
              </Paper>
            </Grid>
            <Grid item xs={12}>
              <Button variant="contained" color="primary" type="submit">
                実行する
              </Button>
            </Grid>
          </Grid>
        </form>
      </div>
    </>
  );
};

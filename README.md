# Teleform
Teleform can help you format Telegram bot messages.

## Installation
```
npm i teleform
```

## Usage
You can use Teleform to format messages, escape special characters, switch formatting styles, convert special entities to formatted text and vice versa.
```
const { STYLES, PARSE_MODES, mdv2, md, html, mdv1, newlines, ln } = require('teleform')
// import { STYLES, PARSE_MODES, mdv2, md, html, mdv1, newlines, ln } from 'teleform'

console.log(STYLES === PARSE_MODES && mdv2 === md && newlines === ln) // true
```

### Formatting
You can use Markdown-style or HTML-style formatting.

#### Markdown
Note that entities must not be nested; and that escaping inside entities is not allowed, so an entity must be closed first and reopened again.
```
const text = [
  mdv1.bold('_bold_'),
  // mdv1.bold('2 * 2 = 4'), // will fail
  mdv1.b('2 ') + mdv1.escape('*') + mdv1.b(' 2 = 4'),
  mdv1.italic('*italic*'),
  // mdv1.italic('snake_case'), // will fail
  mdv1.i('snake') + mdv1.escape('_') + mdv1.i('case'),
  mdv1.link('*_link_*', 'http://www.example.com/'),
  mdv1.link('link with ‘\\’', 'http://www.example.com/\\'),
  mdv1.bold('link with ‘)’ will fail'),
  mdv1.mention('*_mention_*', 123456789),
  mdv1.blockquote('*_just plain text_*'),
  mdv1.code('code'),
  mdv1.pre('code block'),
  mdv1.pre('console.log("javascript code block")', 'javascript')
].join(newlines())
```

#### HTML
Note that custom emoji entities can only be used by bots that purchased additional usernames on [Fragment](https://fragment.com/).
```
const text = [
  html.bold('<bold>'),
  html.strong('<strong>'),
  html.italic('<italic>'),
  html.emphasis('<emphasis>'),
  html.em('<also emphasis>'),
  html.underline('<underline>'),
  html.b(html.i(html.u('<bold italic underline>'), false), false),
  html.inserted('<inserted>'),
  html.ins('<also inserted>'),
  html.strikethrough('<strikethrough>'),
  html.strike('<also strikethrough>'),
  html.deleted('<deleted>'),
  html.del('<also deleted>'),
  html.spoiler('<spoiler>'),
  html.telegram_spoiler('<telegram spoiler>'),
  html.text_link('<link>', 'http://www.example.com/'),
  html.text_mention('<mention>', 123456789),
  html.custom_emoji('👍', 5368324170671202286),
  html.blockquote('<blockquote first line>\n' +
                  '<blockquote second line>\n' +
                  '<blockquote third line>\n' +
                  '<blockquote fourth line>'),
  html.blockquote('<expandable blockquote first line>\n' +
                  '<expandable blockquote second line>\n' +
                  '<expandable blockquote third line>\n' +
                  '<expandable blockquote fourth line>', true),
  html.code('<code>'),
  html.pre('<code block>'),
  html.pre('true && console.log("javascript code block")', 'javascript')
].join(newlines())
```

#### MarkdownV2
Note that in case of ambiguity between `italic` and `underline` entities, `__` is always greadily treated from left to right.
```
const text = [
  md.b('*bold*'),
  md.i('_italic_'),
  md.u('__underline__'),
  // md.b(md.i(md.u('*_bold italic underline_*'), 0), 0), // will fail
  md.b(md.i(md.b('') + md.u('*_bold italic underline_*'), false), false),
  md.s('~strikethrough~'),
  md.spoiler('||spoiler||'),
  md.link('[website](link)', 'http://www.example.com/'),
  md.link('website link with ‘\\’', 'http://www.example.com//\\'),
  md.link('website link with ‘)’', 'http://www.example.com/()'),
  md.mention('[user](mention)', 123456789),
  md.emoji('👍', 5368324170671202286),
  md.quote('>blockquote first line\n' +
            '>blockquote second line\n' +
            '>blockquote third line\n' +
            '>blockquote fourth line'),
  md.quote('>expandable blockquote first line\n' +
            '>expandable blockquote second line\n' +
            '>expandable blockquote third line\n' +
            '>expandable blockquote fourth line||', true),
  md.code('`code`'),
  md.pre('```code block```'),
  md.pre('true && console.log("```javascript code block```")', 'javascript')
].join(ln())
```

### Escaping
You can use `.escape()` methods to escape special characters.
```
.escape(
  string      text,
  array|true  characters_to_be_excluded = [ ],
  boolean     must_escape = true,
  array       the_only_characters_to_be_escaped = [ ]
)
```

#### Markdown
Use `mdv1.escape()` to escape special characters outside of entities.
```
const text = mdv1.escape('[*_`just plain text`_*]')
```

#### HTML
Use `html.escape()` to replace special characters with HTML entities.
```
const text = html.escape('<& just plain text &>')
```

#### MarkdownV2
Use `md.escape()` to escape special characters anywhere in the message.
```
const text = md.escape('([{ \\~_=/ | `_> just plain text -_* ! \\+_#/ }])')
```
You can also escape Markdown-formatted text, which may contain ‘*’, ‘_’, ‘__’, ‘~’, ‘||’ and ‘`’ special characters.
```
const text = md.escape('*Hello!*\n\n' +
  'Have you __had to__ ~escape _special characters_~ in your locale file?\n' +
  'Guess what? ||You need to do it no longer!||\n' +
  'Now you can use regular Markdown text alongside ‘\\*’, ‘\\_’, etc.', true)
```

### Unescaping
If you need to unescape special characters, you can.
```
const mdv1Text = '[*_`just plain text`_*]'
const htmlText = '<& just plain text &>'
const mdv2Text = '([{ \\~_=/ | `_> just plain text -_* ! \\+_#/ }])'

const mdv1TextEscaped = mdv1.escape(mdv1Text)
const htmlTextEscaped = html.escape(htmlText)
const mdv2TextEscaped = mdv2.escape(mdv2Text)

console.log(mdv1Text === mdv1.unescape(mdv1TextEscaped)) // true
console.log(htmlText === html.unescape(htmlTextEscaped)) // true
console.log(mdv2Text === mdv2.unescape(mdv2TextEscaped)) // true
```

### Switch
You can switch text formatting styles.

#### Markdown to HTML
```
const text = mdv1.to_html('<& *just bold text* &>')
```

#### HTML to MarkdownV2
```
const text = html.to_md('([{ \\~_=/ | `_> <b>bold <i>italic <u>underline</u></i></b> -_* ! \\+_#/ }])')
```

#### MarkdownV2 to HTML
```
const text = md.to_html('<& *bold _italic __underline___* &\\>')
```

### Conversion
You can convert special entities to formatted text and vice versa.

#### Entities to Text

##### From Message
```
const message // telegram message

const results = [
  mdv1.from_entities(message),
  html.from_entities(message),
  mdv2.from_entities(message),
]
// [ { [ text | caption ]: [ formatted text ] } ]
```

##### From Variables

###### Markdown
```
const text = 'bold\nitalic\nlink\nmention\ncode\npre\nformatted'
const entities = [
  { offset: 0, length: 4, type: 'bold' },
  { offset: 5, length: 6, type: 'italic' },
  {
    offset: 12,
    length: 4,
    type: 'text_link',
    url: 'http://www.example.com/'
  },
  {
    offset: 17,
    length: 7,
    type: 'text_mention',
    user: { id: 123456789 }
  },
  { offset: 25, length: 4, type: 'code' },
  { offset: 30, length: 3, type: 'pre' },
  { offset: 34, length: 9, type: 'pre', language: 'markup' }
]

const result = mdv1.from_entities(text, entities)
// { [ text | caption ]: [ formatted text ] }
```

###### HTML
```
const text = 'bold\nitalic\nunderline\n' +
    'strikethrough\nspoiler\nlink\nmention\ncode\n' +
    'b\nl\no\nc\nk\nq\nu\no\nt\ne\npre\nformatted'
const entities = [
  { offset: 0, length: 5, type: 'bold' },
  { offset: 5, length: 7, type: 'bold' },
  { offset: 5, length: 7, type: 'italic' },
  { offset: 12, length: 9, type: 'bold' },
  { offset: 12, length: 9, type: 'italic' },
  { offset: 12, length: 9, type: 'underline' },
  { offset: 22, length: 13, type: 'strikethrough' },
  { offset: 36, length: 7, type: 'spoiler' },
  {
    offset: 44,
    length: 4,
    type: 'text_link',
    url: 'http://www.example.com/'
  },
  {
    offset: 49,
    length: 7,
    type: 'text_mention',
    user: { id: 123456789 }
  },
  { offset: 57, length: 4, type: 'code' },
  { offset: 62, length: 9, type: 'blockquote' },
  { offset: 72, length: 9, type: 'expandable_blockquote' },
  { offset: 82, length: 3, type: 'pre' },
  { offset: 86, length: 9, type: 'pre', language: 'markup' }
]

const result = html.from_entities(text, entities)
// { [ text | caption ]: [ formatted text ] }
```

###### MarkdownV2
```
const text = 'bold\nitalic\nunderline\n' +
    'strikethrough\nspoiler\nlink\nmention\ncode\n' +
    'b\nl\no\nc\nk\nq\nu\no\nt\ne\npre\nformatted'
const entities = [
  { offset: 0, length: 5, type: 'bold' },
  { offset: 5, length: 7, type: 'bold' },
  { offset: 5, length: 7, type: 'italic' },
  { offset: 12, length: 9, type: 'bold' },
  { offset: 12, length: 9, type: 'italic' },
  { offset: 12, length: 9, type: 'underline' },
  { offset: 22, length: 13, type: 'strikethrough' },
  { offset: 36, length: 7, type: 'spoiler' },
  {
    offset: 44,
    length: 4,
    type: 'text_link',
    url: 'http://www.example.com/'
  },
  {
    offset: 49,
    length: 7,
    type: 'text_mention',
    user: { id: 123456789 }
  },
  { offset: 57, length: 4, type: 'code' },
  { offset: 62, length: 9, type: 'blockquote' },
  { offset: 72, length: 9, type: 'expandable_blockquote' },
  { offset: 82, length: 3, type: 'pre' },
  { offset: 86, length: 9, type: 'pre', language: 'markup' }
]

const result = md.from_entities(text, entities)
// { [ text | caption ]: [ formatted text ] }
```

#### Text to Entities

##### From Message
```
const message // telegram message

const results = [
  mdv1.to_entities(message),
  html.to_entities(message),
  mdv2.to_entities(message),
]
/*
[
  {
    [ text | caption ]: [ plain text ],
    [ entities | caption_entities ]: [ [ special entities ] ]
  }
]
*/
```

##### From Variables

###### Markdown
```
const text = '*bold*\n_italic_\n' +
    '[link](http://www.example.com/)\n' +
    '[mention](tg://user?id=123456789)\n' +
    '`code`\n```pre```\n```markup\nformatted```'

const result = mdv1.to_entities(text)
/*
[
  {
    [ text | caption ]: [ plain text ],
    [ entities | caption_entities ]: [ [ special entities ] ]
  }
]
*/
```

###### HTML
```
const text = '< b >bold< / b >\n' +
    '< strong >strong< / strong >\n' +
    '< i >italic< / i >\n' +
    '< em >emphasis< / em >\n' +
    '< u >underline< / u >\n' +
    '< ins >inserted< / ins >\n' +
    '<b>bold <i>italic <u>underline</u></i></b>\n' +
    '< s >strikethrough< / s >\n' +
    '< strike >strike< / strike >\n' +
    '< del >deleted< / del >\n' +
    '< span class = "tg-spoiler" >spoiler< / span >\n' +
    '< tg-spoiler >telegram spoiler< / tg-spoiler >\n' +
    '< a href = "http://www.example.com/" >link< / a >\n' +
    '< a href = "tg://user?id=123456789" >mention< / a >\n' +
    '< tg-emoji emoji-id = "5368324170671202286" >👍< / tg-emoji >\n' +
    '< code >code< /code >\n' +
    '< blockquote >b\nl\no\nc\nk< / blockquote >\n' +
    '< blockquote expandable >q\nu\no\nt\ne< / blockquote >\n' +
    '< pre >pre< / pre >\n' +
    '< pre >< code class = "language-markup" >formatted< / code >< / pre >'

const result = html.to_entities(text)
/*
[
  {
    [ text | caption ]: [ plain text ],
    [ entities | caption_entities ]: [ [ special entities ] ]
  }
]
*/
```

###### MarkdownV2
```
const text = '*bold*\n' +
    '_italic_\n' +
    '__underline__\n' +
    '*bold _italic __underline___*\n' +
    '~strikethrough~\n' +
    '||spoiler||\n' +
    '[link](http://www.example.com/)\n' +
    '[mention](tg://user?id=123456789)\n' +
    '![👍](tg://emoji?id=5368324170671202286)\n' +
    '`code`\n' +
    '>b\n>l\n>o\n>c\n>k\n' +
    '**>q\n>u\n>o\n>t\n>e||\n' +
    '```pre```\n' +
    '```markup\nformatted```'

const result = md.to_entities(text)
/*
[
  {
    [ text | caption ]: [ plain text ],
    [ entities | caption_entities ]: [ [ special entities ] ]
  }
]
*/
```

##### With User Contents
You can use `.to_entities()` with stored user contents as well.
```
.to_entities(
  string      your_text,
  string|null user_text = null,
  array|null  user_text_entities = [ ]
)
```

###### MarkdownV2
```
const text = '*bold*\n' +
    '_italic_\n' +
    '__underline__\n' +
    '*bold _italic __underline___*\n' +
    '~strikethrough~\n' +
    '||spoiler||\n' +
    '[link](http://www.example.com/)\n' +
    '[mention](tg://user?id=123456789)\n' +
    '![👍](tg://emoji?id=5368324170671202286)\n' +
    '`code`\n' +
    '>b\n>l\n>o\n>c\n>k\n' +
    '**>q\n>u\n>o\n>t\n>e||\n' +
    '```pre```\n' +
    '```markup\nformatted```'
const userText = 'My name is Anatoly'
const userTextEntities = [ {
  offset: 0,
  length: 18,
  type: 'bold'
} ]

const result = md.to_entities(
  text,
  userText + ln(2),
  userTextEntities
)
/*
[
  {
    [ text | caption ]: [ plain text ],
    [ entities | caption_entities ]: [ [ special entities ] ]
  }
]
*/
```

## Contributing
Contributions are only allowed in TON:
```
UQCYqT9-ycmXE3o57Cac1sM5ntIKdjqIwP3kzWmiZik0VU_b
```
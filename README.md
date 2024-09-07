# Teleform
Teleform can help you format Telegram messages, escape special characters, switch formatting styles, convert special entities to formatted text and vice versa, use Unicode symbols, and form Telegram links.

## Installation
```
npm i teleform
```

## Usage
```
const {
  STYLES, PARSE_MODES,
  mdv2, md, html, mdv1,
  newlines, ln,
  symbol, sm,
  link, telink
} = require('teleform')
/*
import {
  STYLES, PARSE_MODES,
  mdv2, md, html, mdv1,
  newlines, ln,
  symbol, sm,
  link, telink
} from 'teleform'
*/

console.log(STYLES === PARSE_MODES) // true
console.log(md === mdv2)            // true
console.log(ln === newlines)        // true
console.log(sm === symbol)          // true
console.log(telink === link)        // true
```

### Formatting
You can use Markdown-style or HTML-style formatting.

#### Markdown
Note that entities must not be nested; and that escaping inside entities is not allowed, so an entity must be closed first and reopened again.
```
const result = { text: [
  mdv1.bold('_bold_'),
  // mdv1.bold('2 * 2 = 4'), // will fail
  mdv1.b('2 ') + mdv1.escape('*') + mdv1.b(' 2 = 4'),
  mdv1.italic('*italic*'),
  // mdv1.italic('snake_case'), // will fail
  mdv1.i('snake') + mdv1.escape('_') + mdv1.i('case'),
  mdv1.link('*_link_*', 'http://www.example.com/'),
  mdv1.link('link with ‘\\’', 'http://www.example.com//\\'),
  // mdv1.link('will fail', 'http://www.example.com/()'),
  mdv1.mention('*_mention_*', 1234567890),
  mdv1.code('code'),
  mdv1.pre('code block'),
  mdv1.pre('console.log("javascript code block")', 'javascript')
].join(newlines()) }
```

#### HTML
Note that custom emoji entities can only be used by bots that purchased additional usernames on [Fragment](https://fragment.com/).
```
const result = { text: [
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
  html.text_mention('<mention>', 1234567890),
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
].join(newlines()) }
```

#### MarkdownV2
Note that in case of ambiguity between `italic` and `underline` entities, `__` is always greadily treated from left to right.
```
const result = { text: [
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
  md.mention('[user](mention)', 1234567890),
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
].join(ln()) }
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
const text = '[*_`just plain text`_*]'
const result = { text: mdv1.escape(text) }
```

#### HTML
Use `html.escape()` to replace special characters with HTML entities.
```
const text = '<& just plain text &>'
const result = { text: html.escape(text) }
```

#### MarkdownV2
Use `md.escape()` to escape special characters anywhere in the message.
```
const text = '([{ \\~_=/ | `_> ' +
             'just plain text' +
             ' -_* ! \\+_#/ }])'
const result = { text: md.escape(text) }
```
You can also escape Markdown-formatted text, which may contain ‘*’, ‘_’, ‘__’, ‘~’, ‘||’ and ‘`’ special characters.
```
const result = { text: md.escape(
  '*Hello!*\n\n' +
  'Have you __had to__ ~escape _special characters_~ in your locale file?\n' +
  'Guess what? ||You need to do it no longer!||\n' +
  'Now you can use regular Markdown text alongside ‘\\*’, ‘\\_’, etc.',
  true
) }
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
const text = '<& *just bold text* &>'
const result = { text: mdv1.to_html(text) }
```

#### HTML to MarkdownV2
```
const text = '([{ \\~_=/ | `_> ' +
             '<b>bold <i>italic <u>underline</u></i></b>' +
             ' -_* ! \\+_#/ }])'
const result = { text: html.to_md(text) }
```

#### MarkdownV2 to HTML
```
const text = '<& *bold _italic __underline___* &\\>'
const result = { text: md.to_html(text) }
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
    user: { id: 1234567890 }
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
    user: { id: 1234567890 }
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
    user: { id: 1234567890 }
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
    '[mention](tg://user?id=1234567890)\n' +
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
    '< a href = "tg://user?id=1234567890" >mention< / a >\n' +
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
    '[mention](tg://user?id=1234567890)\n' +
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
  string          text,
  boolean|number  maxlen = false,
  string|null     user_text = null,
  array|null      user_text_entities = [ ]
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
    '[mention](tg://user?id=1234567890)\n' +
    '![👍](tg://emoji?id=5368324170671202286)\n' +
    '`code`\n' +
    '>b\n>l\n>o\n>c\n>k\n' +
    '**>q\n>u\n>o\n>t\n>e||\n' +
    '```pre```\n' +
    '```markup\nformatted```'
const userText = 'My name is Anatoly'
const userEntities = [ {
  offset: 0,
  length: 18,
  type: 'bold'
} ]

const result = md.to_entities(
  text,
  true, // or 4096
  userText + ln(2),
  userEntities
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

### Using Unicode
You can use a few Unicode symbols with the `symbol` function.
```
for (const code of [
  '0',  // 🯰
  '1',  // 🯱
  '2',  // 🯲
  '3',  // 🯳
  '4',  // 🯴
  '5',  // 🯵
  '6',  // 🯶
  '7',  // 🯷
  '8',  // 🯸
  '9',  // 🯹
  '8-', // ∞ (infinity)
  '+',  // + (plus)
  '-',  // − (minus)
  '+-', // ± (plus‐minus)
  '*',  // × (multiplication)
  '/',  // ÷ (division)
  '=',  // =
  '>=', // ≥
  '<=', // ≤
  '~~', // ≈
  '!=', // ≠
  '.',  // · (middle dot)
  'o',  // ° (degree)
  'O',  // • (bullet)
  '>_', // 🮥
  '<',  // ‹
  '>',  // ›
  '<<', // «
  '>>', // »
  'h',  // ‐ (hyphen)
  'H',  // ‑ (non‐breaking hyphen)
  '-',  // – (en dash)
  '--', // — (em dash)
  '...' // … (horizontal ellipsis)
]) console.log(`${code} => ${symbol(code)}`)
```

### Forming Links
You can form links to Telegram users, bots, groups, channels, etc.
```
const result = { text: telink.create({
  // string
  // username, telephone number, etc.
  subject: 'mybot',
  // number|string
  // message ID, application name, etc.
  element: 'myapp',
  // string
  // includes a start parameter entity: `?start=message`
  entity: 'message',
  // scalar
  // includes a start parameter entity ID: `?start=message-8`
  id: 8,
  // object
  // query parameters
  params: {
    mode: telink.parameters.mode.compact,
    choose: Object.values(telink.parameters.choose)
  },
  // string
  // username or telephone number of a specific user
  // to open the attachment menu in the chat therewith
  user: 'username',
  // string|boolean
  // starting operation
  // true to delegate the selection
  launch: true,
  // string|boolean|null
  // prompts to add the bot to the attachment menu
  // null for links not related to applications
  attach: true,
  // boolean
  // true to use the `t.me` syntax
  short: true,
  // boolean
  // true to use the `tg` syntax
  proto: false
}) }
// https://t.me/username/myapp
// ?attach=mybot&startattach=message-8
// &mode=compact&choose=users+bots+groups+channels
```
You can opt to use the `t.me` or `tg` syntax by default.
```
(telink.short = true) && (telink.proto = false)
``` 

#### User Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.user(1234567890),
  // tg:user?id=1234567890
  telink.user('+1234567890'),
  // t.me/+1234567890
  telink.user('username'),
  // t.me/username
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.user(1234567890),
  // tg://user?id=1234567890
  telink.user('+1234567890'),
  // tg://resolve?phone=1234567890
  telink.user('username')
  // tg://resolve?domain=username
].join(ln()) }
```

#### Bot & App Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true

  telink.bot('mybot'),
  // t.me/mybot
  telink.bot('mybot', 'message', 8),
  // t.me/mybot?start=message-8

  telink.bot('mybot', null, null, true),
  // t.me/mybot?startgroup
  telink.bot('mybot', 'message', 8, true),
  // t.me/mybot?startgroup=message-8
  telink.bot('mybot', 'message', 8, true, [ 'delete_messages' ]),
  // t.me/mybot?startgroup=message-8&admin=delete_messages
  telink.bot('mybot', true, [ 'post_messages' ]),
  // t.me/mybot?startchannel&admin=post_messages

  telink.game('mybot', 'short_name'),
  // t.me/mybot?game=short_name

  telink.app('mybot'),
  // t.me/mybot?startapp
  telink.app('mybot', null, 'comment', 8),
  // t.me/mybot?startapp=comment-8
  telink.app('mybot', null, 'comment', 8, true),
  // t.me/mybot?startapp=comment-8&mode=compact

  telink.app('mybot', 'myapp'),
  // t.me/mybot/myapp
  telink.app('mybot', 'myapp', 'comment', 8),
  // t.me/mybot/myapp?startapp=comment-8
  telink.app('mybot', 'myapp', 'comment', 8, true),
  // t.me/mybot/myapp?startapp=comment-8&mode=compact

  telink.app('mybot', true),
  // t.me/mybot?startattach
  telink.app('mybot', true, 'comment', 8),
  // t.me/mybot?startattach=comment-8

  telink.app('mybot', null, null, null, false, 'username'),
  // t.me/username?attach=mybot
  telink.app('mybot', null, 'comment', 8, false, '+1234567890'),
  // t.me/+1234567890?attach=mybot&startattach=comment-8

  telink.app('mybot', true, null, null, false, [ 'users', 'bots' ]),
  // t.me/mybot?startattach&choose=users+bots
  telink.app('mybot', true, 'comment', 8, false, [ 'groups', 'channels' ]),
  // t.me/mybot?startattach=comment-8&choose=groups+channels

  (telink.short = false) ||
  (telink.proto = true),
  // true

  telink.bot('mybot'),
  // tg://resolve?domain=mybot
  telink.bot('mybot', 'message', 8),
  // tg://resolve?domain=mybot&start=message-8

  telink.bot('mybot', null, null, true),
  // tg://resolve?domain=mybot&startgroup
  telink.bot('mybot', 'message', 8, true),
  // tg://resolve?domain=mybot&startgroup=message-8
  telink.bot('mybot', 'message', 8, true, [ 'delete_messages' ]),
  // tg://resolve?domain=mybot&startgroup=message-8&admin=delete_messages
  telink.bot('mybot', true, [ 'post_messages' ]),
  // tg://resolve?domain=mybot&startchannel&admin=post_messages

  telink.game('mybot', 'short_name'),
  // tg://resolve?domain=mybot&game=short_name

  telink.app('mybot'),
  // tg://resolve?domain=mybot&startapp
  telink.app('mybot', null, 'comment', 8),
  // tg://resolve?domain=mybot&startapp=comment-8
  telink.app('mybot', null, 'comment', 8, true),
  // tg://resolve?domain=mybot&startapp=comment-8&mode=compact

  telink.app('mybot', 'myapp'),
  // tg://resolve?domain=mybot&appname=myapp
  telink.app('mybot', 'myapp', 'comment', 8),
  // tg://resolve?domain=mybot&appname=myapp&startapp=comment-8
  telink.app('mybot', 'myapp', 'comment', 8, true),
  // tg://resolve?domain=mybot&appname=myapp&startapp=comment-8&mode=compact

  telink.app('mybot', true),
  // tg://resolve?domain=mybot&startattach
  telink.app('mybot', true, 'comment', 8),
  // tg://resolve?domain=mybot&startattach=comment-8

  telink.app('mybot', null, null, null, false, 'username'),
  // tg://resolve?domain=username&attach=mybot
  telink.app('mybot', null, 'comment', 8, false, '+1234567890'),
  // tg://resolve?phone=1234567890&attach=mybot&startattach=comment-8

  telink.app('mybot', true, null, null, false, [ 'users', 'bots' ]),
  // tg://resolve?domain=mybot&startattach&choose=users+bots
  telink.app('mybot', true, 'comment', 8, false, [ 'groups', 'channels' ])
  // tg://resolve?domain=mybot&startattach=comment-8&choose=groups+channels
].join(ln()) }
```

#### Group & Channel Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.group('mygroup'),
  // t.me/mygroup
  telink.channel('mychannel'),
  // t.me/mychannel
  telink.invite('hash'),
  // t.me/+hash
  telink.invite('hash', false),
  // t.me/joinchat/hash
  telink.folder('slug'),
  // t.me/addlist/slug
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.group('mygroup'),
  // tg://resolve?domain=mygroup
  telink.channel('mychannel'),
  // tg://resolve?domain=mychannel
  telink.invite('hash'),
  // tg://join?invite=hash
  telink.folder('slug')
  // tg://addlist?slug=slug
].join(ln()) }
```

#### Message Links
```
const tid = 1 // thread ID
const mid = 2 // message ID
const cid = 3 // comment ID
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.forum(12345, null, tid),
  // t.me/c/12345?thread=1
  telink.forum('mygroup', mid, tid),
  // t.me/mygroup/1/2
  telink.message(67890, mid, cid, tid, true),
  // t.me/c/67890/1/2?single&comment=3
  telink.message('mychannel', mid, cid, tid, false, 3723, 'h'),
  // t.me/mychannel/1/2?comment=3&t=1h02m03s
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.forum(12345, null, tid),
  // tg://privatepost?channel=12345&thread=1
  telink.forum('mygroup', mid, tid),
  // tg://resolve?domain=mygroup&post=2&thread=1
  telink.message(67890, mid, cid, tid, true),
  // tg://privatepost?channel=67890&post=2&single&thread=1&comment=3
  telink.message('mychannel', mid, cid, tid, false, '1h02m03s', 'm')
  // tg://resolve?domain=mychannel&post=2&thread=1&comment=3&t=62:03
].join(ln()) }
```

#### Video/Voice Chats & Livestream Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.videochat('mygroup'),
  // t.me/mygroup?videochat
  telink.videochat('mygroup', 'invite_hash'),
  // t.me/mygroup?videochat=invite_hash
  telink.voicechat('mygroup'),
  // t.me/mygroup?voicechat
  telink.voicechat('mygroup', 'invite_hash'),
  // t.me/mygroup?voicechat=invite_hash
  telink.livestream('mychannel'),
  // t.me/mychannel?livestream
  telink.livestream('mychannel', 'invite_hash'),
  // t.me/mychannel?livestream=invite_hash
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.videochat('mygroup'),
  // tg://resolve?domain=mygroup&videochat
  telink.videochat('mygroup', 'invite_hash'),
  // tg://resolve?domain=mygroup&videochat=invite_hash
  telink.voicechat('mygroup'),
  // tg://resolve?domain=mygroup&voicechat
  telink.voicechat('mygroup', 'invite_hash'),
  // tg://resolve?domain=mygroup&voicechat=invite_hash
  telink.livestream('mychannel'),
  // tg://resolve?domain=mychannel&livestream
  telink.livestream('mychannel', 'invite_hash')
  // tg://resolve?domain=mychannel&livestream=invite_hash
].join(ln()) }
```

#### Share Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.share('www.example.com'),
  // t.me/share?url=www.example.com
  telink.share('www.example.com', 'Example'),
  // t.me/share?url=www.example.com&text=Example
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.share('www.example.com'),
  // tg://msg_url?url=www.example.com
  telink.share('www.example.com', 'Example')
  // tg://msg_url?url=www.example.com&text=Example
].join(ln()) }
```

#### Boost Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.boost(12345),
  // t.me/c/12345?boost
  telink.boost(67890, false),
  // t.me/boost?c=67890
  telink.boost('newchannel'),
  // t.me/boost/newchannel
  telink.boost('oldchannel', false),
  // t.me/oldchannel?boost
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.boost(88888),
  // tg://boost?channel=88888
  telink.boost('anychannel')
  // tg://boost?domain=anychannel
].join(ln()) }
```

#### Story Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.story('username', 'story_id'),
  // t.me/username/s/story_id
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.story('username', 'story_id')
  // tg://resolve?domain=username&story=story_id
].join(ln()) }
```

#### Emojis & Stickers Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.emojis('slug'),
  // t.me/addemoji/slug
  telink.stickers('slug'),
  // t.me/addstickers/slug
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.emoji('5368324170671202286'),
  // tg://emoji?id=5368324170671202286
  telink.emojis('slug'),
  // tg://addemoji?set=slug
  telink.stickers('slug')
  // tg://addstickers?set=slug
].join(ln()) }
```

#### Premium Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.premium('giftcode'),
  // t.me/giftcode
  telink.premium(1, 'slug'),
  // t.me/giftcode/slug
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.premium('giftcode'),
  // tg://giftcode
  telink.premium(1, 'slug'),
  // tg://giftcode?slug=slug
  telink.premium('offer'),
  // tg://premium_offer
  telink.premium(2, 'referrer'),
  // tg://premium_offer?ref=referrer
  telink.premium('multigift'),
  // tg://premium_multigift
  telink.premium(3, 'referrer')
  // tg://premium_multigift?ref=referrer
].join(ln()) }
```

#### Invoice Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.invoice('slug'),
  // t.me/$slug
  telink.invoice('slug', false),
  // t.me/invoice/slug
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.invoice('slug')
  // tg://invoice?slug=slug
].join(ln()) }
```

#### Language Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.language('slug'),
  // t.me/setlanguage/slug
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.language('slug')
  // tg://setlanguage?lang=slug
].join(ln()) }
```

#### Theme Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.theme('name'),
  // t.me/addtheme/name
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.theme('name')
  // tg://addtheme?slug=name
].join(ln()) }
```

#### Wallpaper Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true

  telink.bg('slug', false, false),
  // t.me/bg/slug
  telink.bg('slug', true, true),
  // t.me/bg/slug?mode=blur+motion

  telink.bg('DC143C'),
  // t.me/bg/DC143C
  telink.bg('FF0000', 'FFC0CB'),
  // t.me/bg/FF0000-FFC0CB
  telink.bg('FF7F50', 'FFA500', 90),
  // t.me/bg/FF7F50-FFA500?rotation=90

  telink.bg('FFD700', 'FFFF00', 'FFE4B5'),
  // t.me/bg/FFD700~FFFF00~FFE4B5
  telink.bg('F0E68C', 'E6E6FA', 'EE82EE', 'DA70D6'),
  // t.me/bg/F0E68C~E6E6FA~EE82EE~DA70D6

  telink.bg('slug', 'FF00FF', 10),
  // t.me/bg/slug?bg_color=FF00FF&intensity=10
  telink.bg('slug', '800080', 20, true),
  // t.me/bg/slug?bg_color=800080&intensity=20&mode=motion

  telink.bg('slug', '4B0082', '00FF00', 30),
  // t.me/bg/slug?bg_color=4B0082-00FF00&intensity=30
  telink.bg('slug', '008000', '008080', 40, 180),
  // t.me/bg/slug?bg_color=008000-008080&intensity=40&rotation=180
  telink.bg('slug', '00FFFF', '7FFFD4', 50, 270, true),
  // t.me/bg/slug?bg_color=00FFFF-7FFFD4&intensity=50&rotation=270&mode=motion

  telink.bg('slug', '40E0D0', '0000FF', '000080', 60),
  // t.me/bg/slug?bg_color=40E0D0~0000FF~000080&intensity=60
  telink.bg('slug', 'D2691E', 'A52A2A', '800000', 70, true),
  // t.me/bg/slug?bg_color=D2691E~A52A2A~800000&intensity=70&mode=motion
  telink.bg('slug', 'FFFFFF', 'F0FFFF', 'F5F5DC', 'FFFFF0', 80),
  // t.me/bg/slug?bg_color=FFFFFF~F0FFFF~F5F5DC~FFFFF0&intensity=80
  telink.bg('slug', 'FAF0E6', 'C0C0C0', '808080', '000000', 90, true),
  // t.me/bg/slug?bg_color=FAF0E6~C0C0C0~808080~000000&intensity=90&mode=motion

  (telink.short = false) ||
  (telink.proto = true),
  // true

  telink.bg('slug', false, false),
  // tg://bg?slug=slug
  telink.bg('slug', true, true),
  // tg://bg?slug=slug&mode=blur+motion

  telink.bg('DC143C'),
  // tg://bg?color=DC143C
  telink.bg('FF0000', 'FFC0CB'),
  // tg://bg?gradient=FF0000-FFC0CB
  telink.bg('FF7F50', 'FFA500', 90),
  // tg://bg?gradient=FF7F50-FFA500&rotation=90

  telink.bg('FFD700', 'FFFF00', 'FFE4B5'),
  // tg://bg?gradient=FFD700~FFFF00~FFE4B5
  telink.bg('F0E68C', 'E6E6FA', 'EE82EE', 'DA70D6'),
  // tg://bg?gradient=F0E68C~E6E6FA~EE82EE~DA70D6

  telink.bg('slug', 'FF00FF', 10),
  // tg://bg?slug=slug&bg_color=FF00FF&intensity=10
  telink.bg('slug', '800080', 20, true),
  // tg://bg?slug=slug&bg_color=800080&intensity=20&mode=motion

  telink.bg('slug', '4B0082', '00FF00', 30),
  // tg://bg?slug=slug&bg_color=4B0082-00FF00&intensity=30
  telink.bg('slug', '008000', '008080', 40, 180),
  // tg://bg?slug=slug&bg_color=008000-008080&intensity=40&rotation=180
  telink.bg('slug', '00FFFF', '7FFFD4', 50, 270, true),
  // tg://bg?slug=slug&bg_color=00FFFF-7FFFD4&intensity=50&rotation=270&mode=motion

  telink.bg('slug', '40E0D0', '0000FF', '000080', 60),
  // tg://bg?slug=slug&bg_color=40E0D0~0000FF~000080&intensity=60
  telink.bg('slug', 'D2691E', 'A52A2A', '800000', 70, true),
  // tg://bg?slug=slug&bg_color=D2691E~A52A2A~800000&intensity=70&mode=motion
  telink.bg('slug', 'FFFFFF', 'F0FFFF', 'F5F5DC', 'FFFFF0', 80),
  // tg://bg?slug=slug&bg_color=FFFFFF~F0FFFF~F5F5DC~FFFFF0&intensity=80
  telink.bg('slug', 'FAF0E6', 'C0C0C0', '808080', '000000', 90, true)
  // tg://bg?slug=slug&bg_color=FAF0E6~C0C0C0~808080~000000&intensity=90&mode=motion
].join(ln()) }
```

#### Proxy Links
```
const result = { text: [
  telink.proxy('www.example.com', 443, 'secret'),
  // https://telegram.me/proxy
  // ?server=www.example.com&port=443&secret=secret
  telink.socks5('www.example.com', 443, 'username', 'password')
  // https://telegram.me/socks
  // ?server=www.example.com&port=443&user=username&pass=password
].join(ln()) }
```

#### Settings Links
```
const result = { text: [
  telink.settings(),
  // tg://settings
  telink.change_number(),
  // tg://settings/change_number
  telink.devices(),
  // tg://settings/devices
  telink.folders(),
  // tg://settings/folders
  telink.languages(),
  // tg://settings/language
  telink.privacy(),
  // tg://settings/privacy
  telink.auto_delete(),
  // tg://settings/auto_delete
  telink.edit_profile(),
  // tg://settings/edit_profile
  telink.themes()
  // tg://settings/themes
].join(ln()) }
```

#### Passport Links
```
const result = { text: [
  telink.passport({
    bot_id: 9876543210,
    scope: { d: [ { _: 'pd' } ], v: 1 },
    public_key: 'bot_public_key',
    nonce: 'nonce',
    callback_url: 'https://www.example.com/callback/'
  })
].join(ln()) }
// tg://passport
// ?bot_id=9876543210
// &scope=%7B%22d%22%3A%5B%7B%22_%22%3A%22pd%22%7D%5D%2C%22v%22%3A1%7D
// &public_key=bot_public_key
// &nonce=nonce
// &callback_url=https%3A%2F%2Fwww.example.com%2Fcallback%2F
```

#### Other Links
```
const result = { text: [
  (telink.https = null) ||
  (telink.short = true),
  // true
  telink.contact('token'),
  // t.me/contact/token
  telink.login('code'),
  // t.me/login/code
  telink.login(null, 'base64encodedtoken'),
  // tg://login?token=base64encodedtoken
  telink.confirm_phone('+1234567890', 'hash'),
  // t.me/confirmphone?phone=1234567890&hash=hash
  (telink.short = false) ||
  (telink.proto = true),
  // true
  telink.contact('token'),
  // tg://contact?token=token
  telink.login('code'),
  // tg://login?code=code
  telink.login(null, 'base64encodedtoken'),
  // tg://login?token=base64encodedtoken
  telink.confirm_phone('+1234567890', 'hash')
  // tg://confirmphone?phone=1234567890&hash=hash
].join(ln()) }
```

## Contributing
Contributions are only allowed in TON:
```
UQCYqT9-ycmXE3o57Cac1sM5ntIKdjqIwP3kzWmiZik0VU_b
```

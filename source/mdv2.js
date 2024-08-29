import { mdv1 } from './mdv1'
import { html } from './html'

export { mdv2 }

class mdv2 extends mdv1 {
  static _to_escape = [
    '\\',
    '_',
    '*',
    '[',
    ']',
    '(',
    ')',
    '~',
    '`',
    '>',
    '#',
    '+',
    '-',
    '=',
    '|',
    '{',
    '}',
    '.',
    '!'
  ]
  static _tags = (type, optional) => ({
    blockquote: [ '**>', '' ],
    expandable_blockquote: [ '**>', '||' ],
    bold: [ '*', '*' ],
    underline: [ '__', '__' ],
    italic: [ '_', '_' ],
    strikethrough: [ '~', '~' ],
    spoiler: [ '||', '||' ],
    pre: [ `\`\`\`${optional ?? ''}\n`, '```' ],
    code: [ '`', '`' ],
    text_link: [ '[', `](${optional})` ],
    text_mention: [ '[', `](tg://user?id=${optional})` ],
    custom_emoji: [ '![', `](tg://emoji?id=${optional})` ]
  }[type])

  static _underlined_name = 'underlined'

  static _underlined_regexp = new RegExp(
    '(?:(?<=\\\\\\\\)|(?<!\\\\))__' +
    '(?<text>[\\s\\S]*?)' +
    '(?:(?<=\\\\\\\\)|(?<!\\\\))__',
    'g'
  )
  static _regexp = new RegExp(
    '(?<blockquote>' +
        '(?<blockquote_contents>^(?:\\*\\*)?>.+(?:\\n^>.*)*))|' +
    '(?<bold>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\*' +
        '(?<bold_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\*)|' +
    '(?<underline>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))' +
        this._name(this._underlined_name) +
        '(?<underline_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))' +
        `${this._name(this._underlined_name)})|` +
    '(?<italic>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))_' +
        '(?<italic_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))_)|' +
    '(?<strikethrough>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))~' +
        '(?<strikethrough_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))~)|' +
    '(?<spoiler>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\|\\|' +
        '(?<spoiler_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\|\\|)|' +
    '(?<pre>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))```' +
        '(?:(?<pre_language>(?<!\\s)[^`\\n]+)\\n)?\\n?' +
        '(?<pre_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))```)|' +
    '(?<code>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))`' +
        '(?<code_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))`)|' +
    '(?<text_link>(?:(?:(?<=\\\\\\\\)|(?<!\\\\))!)?' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\[' +
        '(?<text_link_text>[\\s\\S]*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\]' +
        '\\((?<text_link_data>.+?)(?:(?<=\\\\\\\\)|(?<!\\\\))\\))',
    'gm'
  )

  static to_html(string) {
    return this._toggle(string, html)
  }
  static to_mdv1(string) {
    return this._toggle(string, mdv1)
  }
  
  static bold(string, escape = true) {
    return `*${this.escape(string, [ ], escape)}*`
  }
  static italic(string, escape = true) {
    return `_${this.escape(string, [ ], escape)}_`
  }
  static underline(string, escape = true) {
    return `__${this.escape(string, [ ], escape)}__`
  }
  static strikethrough(string, escape = true) {
    return `~${this.escape(string, [ ], escape)}~`
  }
  static spoiler(string, escape = true) {
    return `||${this.escape(string, [ ], escape)}||`
  }
  static text_link(string, url, escape = true) {
    return `[${this.escape(string, [ ], escape)}](${this.escape(url, [ ], true, [ '\\', ')' ])})`
  }
  static text_mention(string, uid, escape = true) {
    return `[${this.escape(string, [ ], escape)}](tg://user?id=${uid})`
  }
  static custom_emoji(string, eid, escape = true) {
    return `![${this.escape(string, [ ], escape)}](tg://emoji?id=${eid})`
  }
  static code(string, escape = true) {
    return `\`${this.escape(string, [ ], escape)}\``
  }
  static pre(string, language = null, escape = true) {
    return `\`\`\`${language ?? ''}\n${this.escape(string, [ ], escape)}\`\`\``
  }
  static blockquote(string, expandable, escape = true) {
    return `**${this.escape(string, [ ], escape).replace(/^/gm, '>')}${expandable ? '||' : ''}`
  }
}
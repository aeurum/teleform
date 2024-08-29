import { format } from './format'
import { mdv2 } from './mdv2'
import { html } from './html'

export { mdv1 }

class mdv1 extends format {
  static _to_escape = [
    '_',
    '*',
    '`',
    '['
  ]
  static _tags = (type, optional) => ({
    bold: [ '*', '*' ],
    italic: [ '_', '_' ],
    pre: [ `\`\`\`${optional ?? ''}\n`, '```' ],
    code: [ '`', '`' ],
    text_link: [ '[', `](${optional})` ],
    text_mention: [ '[', `](tg://user?id=${optional})` ]
  }[type])

  static _regexp = new RegExp(
    '(?<bold>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\*' +
        '(?<bold_text>.*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\*)|' +
    '(?<italic>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))_' +
        '(?<italic_text>.*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))_)|' +
    '(?<pre>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))```' +
        '((?<pre_language>(?<!\\s)[^`\\n]+)\\n)?\\n?' +
        '(?<pre_text>.*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))```)|' +
    '(?<code>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))`' +
        '(?<code_text>.*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))`)|' +
    '(?<text_link>' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\[' +
        '(?<text_link_text>.*?)' +
        '(?:(?<=\\\\\\\\)|(?<!\\\\))\\]' +
        '\\((?<text_link_data>[^\\n]+?)(?:(?<=\\\\\\\\)|(?<!\\\\))\\))',
    'gs'
  )

  static to_mdv2(string) {
    return this._toggle(string, mdv2)
  }
  static to_md(string) {
    return this.to_mdv2(string)
  }
  static to_html(string) {
    return this._toggle(string, html)
  }

  static bold(string) {
    return `*${string}*`
  }
  static italic(string) {
    return `_${string}_`
  }
  static text_link(string, url) {
    return `[${string}](${url})`
  }
  static text_mention(string, uid) {
    return `[${string}](tg://user?id=${uid})`
  }
  static code(string) {
    return `\`${string}\``
  }
  static pre(string, language) {
    return `\`\`\`${language ?? ''}\n${string}\`\`\``
  }
}
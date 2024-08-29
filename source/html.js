import { format } from './format'
import { mdv2 } from './mdv2'
import { mdv1 } from './mdv1'

export { html }

class html extends format {
  static _to_escape = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;'
  }
  static _tags = (type, optional) => ({
    bold: [ '<b>', '</b>' ],
    italic: [ '<i>', '</i>' ],
    underline: [ '<u>', '</u>' ],
    strikethrough: [ '<s>', '</s>' ],
    spoiler: [ '<tg-spoiler>', '</tg-spoiler>' ],
    text_link: [ `<a href="${optional}">`, '</a>' ],
    text_mention: [ `<a href="tg://user?id=${optional}">`, '</a>' ],
    custom_emoji: [ `<tg-emoji emoji-id="${optional}">`, '</tg-emoji>' ],
    code: [ '<code>', '</code>' ],
    pre: [
      optional ? `<pre><code class="language-${optional}">` : '<pre>',
      optional ? '</code></pre>' : '</pre>'
    ],
    blockquote: [ '<blockquote>', '</blockquote>' ],
    expandable_blockquote: [ '<blockquote expandable>', '</blockquote>' ]
  }[type])

  static _regexp = new RegExp(
    '(?<bold>' +
        '<\\s*(?<bold_tag>b|strong)\\b[^>]*>' +
        '(?<bold_text>.*?)' +
        '<\\s*\\/\\s*\\k<bold_tag>\\s*>)|' +
    '(?<italic>' +
        '<\\s*(?<italic_tag>i|em)\\b[^>]*>' +
        '(?<italic_text>.*?)' +
        '<\\s*\\/\\s*\\k<italic_tag>\\s*>)|' +
    '(?<underline>' +
        '<\\s*(?<underline_tag>u|ins)\\b[^>]*>' +
        '(?<underline_text>.*?)' +
        '<\\s*\\/\\s*\\k<underline_tag>\\s*>)|' +
    '(?<strikethrough>' +
        '<\\s*(?<strikethrough_tag>s|strike|del)\\b[^>]*>' +
        '(?<strikethrough_text>.*?)' +
        '<\\s*\\/\\s*\\k<strikethrough_tag>\\s*>)|' +
    '(?<spoiler>' +
        '<\\s*(?:(?<spoiler_span_tag>span)\\b[^>]*\\b' +
                'class\\s*=\\s*(?<spoiler_span_quote>["\'])?tg-spoiler\\b\\k<spoiler_span_quote>|' +
            '(?<spoiler_tg_tag>tg-spoiler)\\b)[^>]*>' +
        '(?<spoiler_text>.*?)' +
        '<\\s*\\/\\s*\\k<spoiler_span_tag>\\k<spoiler_tg_tag>\\s*>)|' +
    '(?<text_link>' +
        '<\\s*a\\b[^>]*\\b' +
            'href\\s*=\\s*(?<text_link_tag>["\'])?(?<text_link_data>[^\\n]+?)\\k<text_link_tag>[^>]*>' +
        '(?<text_link_text>.*?)' +
        '<\\s*\\/\\s*a\\s*>)|' +
    '(?<custom_emoji>' +
        '<\\s*tg-emoji\\b[^>]*\\b' +
            'emoji-id\\s*=\\s*(?<custom_emoji_quote>["\'])?' +
            '(?<custom_emoji_id>.+?)' +
            '\\k<custom_emoji_quote>[^>]*>' +
        '(?<custom_emoji_text>.*?)' +
        '<\\s*\\/\\s*tg-emoji\\s*>)|' +
    '(?<pre>' +
        '<\\s*pre\\b[^>]*>' +
            '<\\s*code\\b[^>]*\\b' +
                'class=(?<pre_quote>["\'])?' +
                    'language-(?<pre_language>(?<!\\s)[^\\n]+)' +
                '\\k<pre_quote>[^>]*>' +
            '(?<pre_text>.*?)' +
            '<\\s*\\/\\s*code\\s*>' +
        '<\\s*\\/\\s*pre\\s*>)|' +
    '(?<pre2><\\s*pre\\b[^>]*>(?<pre2_text>.*?)<\\s*\\/\\s*pre\\s*>)|' +
    '(?<code>(?<!<\\s*pre\\b[^>]*>\\s*)<\\s*code\\b[^>]*>(?<code_text>.*?)<\\s*\\/\\s*code\\s*>)|' +
    '(?<expandable_blockquote>' +
        '<\\s*blockquote\\b[^>]*\\bexpandable\\b[^>]*>' +
        '(?<expandable_blockquote_text>.*?)' +
        '<\\s*\\/\\s*blockquote\\s*>)|' +
    '(?<blockquote><\\s*blockquote\\b[^>]*>(?<blockquote_text>.*?)<\\s*\\/\\s*blockquote\\s*>)',
    'gis'
  )

  static to_mdv2(string) {
    return this._toggle(string, mdv2)
  }
  static to_md(string) {
    return this.to_mdv2(string)
  }
  static to_mdv1(string) {
    return this._toggle(string, mdv1)
  }
  
  static em(string, escape = true) {
    return this.emphasis(string, escape)
  }
  static ins(string, escape = true) {
    return this.inserted(string, escape)
  }
  static del(string, escape = true) {
    return this.deleted(string, escape)
  }
  
  static bold(string, escape = true) {
    return `<b>${this.escape(string, [ ], escape)}</b>`
  }
  static strong(string, escape = true) {
    return `<strong>${this.escape(string, [ ], escape)}</strong>`
  }
  static italic(string, escape = true) {
    return `<i>${this.escape(string, [ ], escape)}</i>`
  }
  static emphasis(string, escape = true) {
    return `<em>${this.escape(string, [ ], escape)}</em>`
  }
  static underline(string, escape = true) {
    return `<u>${this.escape(string, [ ], escape)}</u>`
  }
  static inserted(string, escape = true) {
    return `<ins>${this.escape(string, [ ], escape)}</ins>`
  }
  static strikethrough(string, escape = true) {
    return `<s>${this.escape(string, [ ], escape)}</s>`
  }
  static strike(string, escape = true) {
    return `<strike>${this.escape(string, [ ], escape)}</strike>`
  }
  static deleted(string, escape = true) {
    return `<del>${this.escape(string, [ ], escape)}</del>`
  }
  static spoiler(string, escape = true) {
    return `<span class="tg-spoiler">${this.escape(string, [ ], escape)}</span>`
  }
  static telegram_spoiler(string, escape = true) {
    return `<tg-spoiler>${this.escape(string, [ ], escape)}</tg-spoiler>`
  }
  static text_link(string, url, escape = true) {
    return `<a href="${url}">${this.escape(string, [ ], escape)}</a>`
  }
  static text_mention(string, uid, escape = true) {
    return `<a href="tg://user?id=${uid}">${this.escape(string, [ ], escape)}</a>`
  }
  static custom_emoji(string, eid, escape = true) {
    return `<tg-emoji emoji-id="${eid}">${this.escape(string, [ ], escape)}</tg-emoji>`
  }
  static code(string, escape = true) {
    return `<code>${this.escape(string, [ ], escape)}</code>`
  }
  static pre(string, language = null, escape = true) {
    if (!language) return `<pre>${this.escape(string, [ ], escape)}</pre>`
    return `<pre><code class="language-${language}">${this.escape(string, [ ], escape)}</code></pre>`
  }
  static blockquote(string, expandable = false, escape = true) {
    return `<blockquote${expandable ? ' expandable' : ''}>${this.escape(string, [ ], escape)}</blockquote>`
  }
}
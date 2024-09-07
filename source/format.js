export { format }

class format {
  static _entities = [
    'bold',
    'italic',
    'underline',
    'strikethrough',
    'spoiler',
    'text_link',
    'custom_emoji',
    'code',
    'pre',
    'blockquote',
    'expandable_blockquote'
  ]
  static _underscore_entities = [
    'italic',
    'underline'
  ]
  static _blockquote_entities = [
    'blockquote',
    'expandable_blockquote'
  ]

  static _to_escape = [ ]
  static _tags = (type, optional) => ({ }[type])

  static _limits = { length: 4096 }
  static _name = name => `telegram-formatting‐${name}`
  
  static _link_regexp = /tg:\/\/(?<type>user|emoji)\?id=(?<id>.+)/
  
  static from_entities(...args) {
    const [ text_name, __, text, entities ] = this._args(...args)
    const tags = this._tags_from_entities(entities)
    return { [ text_name ]: this._text_from_entities(text, tags) }
  }
  static to_entities(args, length = false, to_text = '', to_entities = [ ]) {
    const [ text_name, entities_name, text, __ ] = this._args(args)
    const result = this._text_to_entities(text, to_text.length)
    const output = {
      text: to_text + result.text,
      entities: to_entities.concat(result.entities)
    }
    if (length === true) length = this._limits.length
    if (length > 0) this._clip(output, length)
    return { [ text_name ]: output.text, [ entities_name ]: output.entities }
  }

  static _args(args, entities) {
    if (typeof args !== 'object')
      return [ 'text', 'entities', args, entities ]
    const name = args?.caption ? 'caption' : 'text'
    return [
      name, name === 'text' ? 'entities' : `${name}_entities`,
      args?.text ?? args?.caption, args?.entities ?? args?.caption_entities
    ]
  }
  static _tags_from_entities(entities, tags = { }) {
    for (const entity of entities ?? [ ]) {
      const { type, offset, length, url, user, language, custom_emoji_id } = entity
      const data = this._tags(type, url ?? user?.id ?? language ?? custom_emoji_id)
      if (!data) continue
      const tagend = offset + length
      for (const l of [ offset, tagend ]) if (!tags[l]) tags[l] = [ ]
      tags[offset].push({ type: type, kind: 'opening', data: data[0] })
      tags[tagend].push({ type: type, kind: 'closing', data: data[1] })
    }
    return tags
  }
  static _text_from_entities(text, tags) {
    let result_text = '', open = [ ]
    const characters = text.split('')
    for (let l = 0; l < characters.length + 1; l++) {
      if (tags[l]) for (const tag of tags[l]) {
        switch (tag.kind) {
          case 'opening': open.push(tag.type); break;
          case 'closing': {
            let open_type
            while (open_type !== tag.type) {
              open_type = open.pop()
              if (open_type !== tag.type) {
                const i = tags[l].findLastIndex(tag => (
                  tag.type === open_type &&
                  tag.kind === 'closing'
                ))
                result_text += tags[l][i].data
                tags[l].splice(i, 1)
              }
            }
          }
        }
        result_text += tag.data
        if (
          this.name === 'mdv2' &&
          tag.kind === 'opening' &&
          this._underscore_entities.includes(tag.type)
        ) result_text += '**'
      }
      if (l === characters.length) break
      result_text += this.escape(characters[l])
      if (
        this.name === 'mdv2' &&
        open.some(type => {
          return this._blockquote_entities.includes(type)
        }) && characters[l] === '\n'
      ) result_text += '>'
    }
    return result_text
  }
  static _text_to_entities(text, indent, ii = 0, litter = 0, from = 0) {
    let result_text = '', result_entities = [ ]
    let spot, regexp = structuredClone(this._regexp)
    if (typeof this._underlined_regexp !== 'undefined')
      text = text.replace(
        this._underlined_regexp,
        `${this._name(this._underlined_name)}` +
        '$<text>' +
        `${this._name(this._underlined_name)}`
      )
    while ((spot = regexp.exec(text)) !== null) {
      let type = this._entities.find(type => spot.groups[type])
      if (type === 'blockquote' && !spot.groups.blockquote_text) {
        const narrow_type = type
        let contents = spot.groups[`${type}_contents`]
        if (contents.match(/\|\|$/)) {
          type = 'expandable_blockquote'
          contents = contents.replace(/\|\|$/, '')
        }
        if (type !== narrow_type) spot.groups[type] = spot.groups[narrow_type]
        spot.groups[`${type}_text`] = contents.replace(/^(\*\*)?>/gm, '')
      } else if (spot.groups.pre2) {
        [ type, spot.groups.pre, spot.groups.pre_text ] = [
          'pre', spot.groups.pre2, spot.groups.pre2_text
        ]
      }
      const formatted_part = text.slice(from, spot.index)
      const unescaped_part = this.unescape(formatted_part)
      litter += formatted_part.length - unescaped_part.length
      from = spot.index + spot.groups[type].length
      const part = spot.groups[`${type}_text`]
      const ni = ii + spot.index
      const nested = this._text_to_entities(part, indent, ni, litter)
      const offset = indent + (ni - litter)
      const length = nested.text.length
      litter += spot.groups[type].length - length
      let optional = { }
      if (type === 'text_link') {
        const link_spot = spot.groups.text_link_data.match(this._link_regexp);
        [ type, optional ] = link_spot === null ? [
          'text_link', { url: spot.groups.text_link_data }
        ] : link_spot.groups.type === 'user' ? [
          'text_mention', { user: { id: +link_spot.groups.id } }
        ] : [ 'custom_emoji', { custom_emoji_id: link_spot.groups.id } ]
      } else {
        optional = {
          ...(!spot.groups.pre_language ? { }
            : { language: spot.groups.pre_language }),
          ...(!spot.groups.custom_emoji_id ? { }
            : { custom_emoji_id: spot.groups.custom_emoji_id })
        }
      }
      result_text += unescaped_part + nested.text
      result_entities.push({ type, offset, length, ...optional })
      result_entities.push(...nested.entities)
    }
    result_text += this.unescape(text.slice(from, text.length))
    return { text: result_text, entities: result_entities }
  }
  static _clip(output, length) {
    if (output.text.length > length) {
      output.text = output.text.substring(0, length)
      output.entities = output.entities.filter(entity => {
        return entity.offset + entity.length <= length
      })
    }
  }
  static _toggle(string, to) {
    const { text, entities } = this.to_entities(string)
    return to.from_entities(text, entities).text
  }
  
  static b(string, escape = true) {
    return this.bold(string, escape)
  }
  static i(string, escape = true) {
    return this.italic(string, escape)
  }
  static u(string, escape = true) {
    return this.underline(string, escape)
  }
  static s(string, escape = true) {
    return this.strikethrough(string, escape)
  }
  static link(string, url, escape = true) {
    return this.text_link(string, url, escape)
  }
  static mention(string, uid, escape = true) {
    return this.text_mention(string, uid, escape)
  }
  static emoji(string, eid, escape = true) {
    return this.custom_emoji(string, eid, escape)
  }
  static quote(string, expandable = false, escape = true) {
    return this.blockquote(string, expandable, escape)
  }
  
  static bold(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static italic(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static underline(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static strikethrough(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static spoiler(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static text_link(string, url, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static text_mention(string, uid, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static custom_emoji(string, eid, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static code(string, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static pre(string, language = null, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static blockquote(string, expandable = false, escape = true) {
    return this.escape(string, [ ], escape)
  }
  static expandable_blockquote(string, escape = true) {
    return this.blockquote(string, true, escape)
  }
  
  static escape(string, excluded = [ ], escape = true, only = [ ]) {
    const to_escape = this._characters_to_escape(excluded, only, 1)
    const escapist = this.name === 'html' ? (result, char) => {
      return this._substitute(result, char, this._to_escape[char])
    } : (result, char) => this._substitute(result, char, `\\${char}`)
    return this._escape(escape, string, to_escape, escapist)
  }
  static unescape(string, excluded = [ ], unescape = true, only = [ ]) {
    const to_unescape = this._characters_to_escape(excluded, only, -1)
    const escapist = this.name === 'html' ? (result, char) => {
      return this._substitute(result, this._to_escape[char], char)
    } : (result, char) => this._substitute(result, `\\${char}`, char)
    return this._escape(unescape, string, to_unescape, escapist)
  }

  static _characters_to_escape(excluded, only, vector) {
    if (excluded === true)
      excluded = [ '\\', '*', '_', '~', '|', '`' ]
    const characters = Array.isArray(this._to_escape) ?
      this._to_escape : Object.keys(this._to_escape)
    const to_escape = only.length ?
      only : this._subtract(characters, excluded)
    return vector > 0 ? to_escape : to_escape.toReversed()
  }
  static _escape(escape, string, to_escape, escapist) {
    return escape ? to_escape.reduce(escapist, string) : string
  }
  static _subtract(array, extra) { return array.filter(value => !extra.includes(value)) }
  static _substitute(string, char, withChar) { return string.split(char).join(withChar) }
}

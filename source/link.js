export { link }

class link {
  static joint = '-'

  static https = true
  static short = false
  static proto = false

  static #protocols = {
    tg: 'tg',
    http: 'http',
    https: 'https'
  }
  static #laconic = 't.me'
  static #verbose = 'telegram.me'

  static operations = {
    start: 'start',
    attach: 'attach',
    startapp: 'startapp',
    startattach: 'startattach'
  }
  static parameters = {
    mode: {
      blur: 'blur',
      motion: 'motion',
      compact: 'compact'
    },
    admin: {
      change_info: 'change_info',
      post_messages: 'post_messages',
      edit_messages: 'edit_messages',
      delete_messages: 'delete_messages',
      restrict_members: 'restrict_members',
      invite_users: 'invite_users',
      pin_messages: 'pin_messages',
      manage_topics: 'manage_topics',
      promote_members: 'promote_members',
      manage_video_chats: 'manage_video_chats',
      anonymous: 'anonymous',
      manage_chat: 'manage_chat',
      post_stories: 'post_stories',
      edit_stories: 'edit_stories',
      delete_stories: 'delete_stories'
    },
    choose: {
      users: 'users',
      bots: 'bots',
      groups: 'groups',
      channels: 'channels'
    }
  }

  static #number_regexp = /^(\+)?(\d{4,15})$/
  static #hex_color_regexp = /^([a-f0-9]{6})$/i
  static #timestamp_regexps = {
    s: /^(\d+)$/,
    m: /^(\d+):(\d{1,2})$/,
    h: /^(?:(\d+)h)?(?:(\d{1,2})m)?(?:(\d{1,2})s)$/
  }

  static create(args) {
    this.#adjust(args)
    const {
      subject,
      element,
      entity,
      id,
      params = { },
      user,
      launch,
      attach = false,
      short = this.short,
      proto = this.proto,
      from = undefined
    } = args ?? { }
    return this.#base(short, proto) +
      (!subject ? '' : this.#path(user ?? subject, element) +
      this.#query(launch, attach, entity, id, params, user ? subject : null))
  }

  static #adjust(args, fields = [ ], values = [ ]) {
    if (args?.from == null) return
    if (args?.subject == null) return
    if (typeof args.subject !== 'string')
      args.subject = args.subject.toString()
    if ([ 'group', 'channel' ].includes(args.from))
      if (args.subject.startsWith('c/'))
        return args.subject = null
    if (!this.#is_property_true(args.proto, 'proto')) {
      if (args.from === 'user') {
        const spot = args.subject.match(this.#number_regexp)
        if (spot && !spot[1]) args.subject = '+' + args.subject
      } else if (args.from === 'app' && args.user) {
        if (typeof args.user !== 'string')
          args.user = args.user.toString()
        const spot = args.user.match(this.#number_regexp)
        if (spot && !spot[1]) args.user = '+' + args.user
      }
    } else {
      switch (args.from) {
        case 'user': {
          [ fields, values ] = [ 'domain', args.subject ]
          if (args.from === 'user') {
            const spot = args.subject.match(this.#number_regexp)
            if (spot) [ fields, values ] = [ 'phone', spot[2] ]
          }
          args.subject = 'resolve'
          break
        }
        case 'contact':
        case 'folder':
        case 'stickers':
        case 'emojis':
        case 'theme':
        case 'login':
        case 'language': {
          if (
            args.from === 'login' &&
            !args.element
          ) {
            delete args.params?.code
            break
          }
          fields = {
            contact: 'token',
            folder: 'slug',
            stickers: 'set',
            emojis: 'set',
            theme: 'slug',
            login: 'code',
            language: 'lang'
          }[args.from]
          values = args.element
          args.element = null
          break
        }
        case 'invite': {
          fields = 'invite'
          values = args.subject.replace(/^(\+|joinchat\/)/i, '')
          args.subject = 'join'
          break
        }
        case 'group':
        case 'channel':
        case 'videochat':
        case 'livestream':
        case 'voicechat':
        case 'story':
        case 'bot':
        case 'app':
        case 'game': {
          fields = [ 'domain' ]
          values = [ args.subject ]
          args.subject = 'resolve'
          if (args.from === 'story') {
            fields.push('story')
            values.push(args.element.split('/')[1])
          } else if (args.from === 'app') {
            if (args.element) {
              fields.push('appname')
              values.push(args.element)
            }
            if (args.user) {
              const value0 = values[0]
              if (typeof args.user !== 'string')
                args.user = args.user.toString()
              const spot = args.user.match(this.#number_regexp)
              if (spot) {
                fields[0] = 'phone'
                values[0] = spot[2]
              } else values[0] = args.user
              fields.push('attach')
              values.push(value0)
              delete args.user
            }
          }
          args.element = null
          break
        }
        case 'message': {
          if (args.subject.startsWith('c/')) {
            fields.push('channel')
            values.push(args.subject.split('/')[1])
            args.subject = 'privatepost'
          } else {
            fields.push('domain')
            values.push(args.subject)
            args.subject = 'resolve'
          }
          let elements = null
          if (args.element) {
            elements = args.element.split('/')
            fields.push('post')
            values.push(elements[1] ?? elements[0])
          }
          if (args.params?.single !== undefined) {
            fields.push('single')
            values.push(null)
            delete args.params?.single
          }
          if (elements && elements[1]) {
            fields.push('thread')
            values.push(elements[0])
          }
          args.element = null
          break
        }
        case 'share': {
          args.subject = 'msg_url'
          break
        }
        case 'boost': {
          let subj, priv
          const subjects = args.subject.split('/')
          if (args.element)
            [ subj, priv ] = [ args.element, false ]
          else if (subjects.length > 1)
            [ subj, priv ] = [ subjects[1], true ]
          else if (args.params?.c)
            [ subj, priv ] = [ args.params?.c, true ]
          else [ subj, priv ] = [ args.subject, false ]
          fields = priv ? 'channel' : 'domain'
          values = subj
          args.subject = 'boost'
          args.element = null
          args.params?.c = args.params?.boost = undefined
          break
        }
        case 'invoice': {
          fields = 'slug'
          values = args.element ?? args.subject.substring(1)
          args.subject = 'invoice'
          args.element = null
          break
        }
      }
      if (!Array.isArray(fields))
        [ fields, values ] = [ [ fields ], [ values ] ]
      const list = fields.map((f, i) => [ f, values[i] ])
      args.params = { ...Object.fromEntries(list), ...args.params }
    }
  }
  static #base(short, proto) {
    if (proto)
      return this.#protocols.tg + ':' + (short ? '' : '//')
    else {
      let scheme
      switch (this.https) {
        default: scheme = ''; break;
        case true: scheme = this.#protocols.https; break;
        case false: scheme = this.#protocols.http; break;
      }
      return scheme + (scheme ? '://' : '') + (short ? this.#laconic : this.#verbose) + '/'
    }
  }
  static #path(subject, element) {
    return subject ? element ? `${subject}/${element}` : subject : ''
  }
  static #query(launch, attach, entity, id, params, botapp) {
    const starting = {
      command: this.#start_command(launch ?? !!entity, attach, params),
      param: this.#start_param(entity, id)
    }
    for (const i in params)
      if (
        params[i] === undefined ||
        (Array.isArray(params[i]) && !params[i].length)
      ) delete params[i]
    const pc = structuredClone(params)
    delete params?.domain
    delete params?.phone
    delete params?.appname
    delete params?.attach
    const parameters = {
      ...(!pc?.domain ? { } : { domain: pc?.domain }),
      ...(!pc?.phone ? { } : { phone: pc?.phone }),
      ...(!pc?.appname ? { } : { appname: pc?.appname }),
      ...(!pc?.attach ? { } : { attach: pc?.attach }),
      ...(!botapp ? { }
        : { [ this.operations.attach ]: botapp }),
      ...(!starting.command ? { }
        : { [ starting.command ]: starting.param }), ...params
    }
    if (Object.keys(parameters).length === 0) return ''
    return '?' + Object.entries(parameters).map(([ key, value ]) => {
      const field = encodeURIComponent(key)
      if (value === null) return field
      if (Array.isArray(value))
        value = value.map(encodeURIComponent).join('+')
      else if (typeof value === 'object')
        value = encodeURIComponent(JSON.stringify(value))
      else if ([ 't' ].includes(key)) undefined
      else value = encodeURIComponent(value)
      return `${field}=${value}`
    }).join('&')
  }

  static #start_command(launch, attach, params) {
    switch (true) {
      case typeof launch === 'string': return launch
      case attach: case !!params?.choose: return this.operations.startattach
      case launch: return this.operations[`start${attach === null ? '' : 'app'}`]
    }
  }
  static #start_param(entity, id) {
    return entity ? id ? entity + this.joint + id : entity : null
  }

  static social(args) {
    const {
      did,
      mid,
      cid,
      tid,
      single,
      mt,
      mt_to,
      modern = true,
      short = this.short,
      proto = this.proto,
      from = undefined
    } = args ?? { }
    if (!did) return this.create()
    const subject = this.#resolve_subject(did)
    const element = mid ? (tid && modern ? `${tid}/` : '') + mid : null
    const media_timestamp = mt_to ? this.#convert_timestamp(mt.toString(), mt_to) : mt
    const params = {
      ...(single ? { single: null } : { }),
      ...(tid && (!modern || !mid) ? { thread: tid } : { }),
      ...(cid ? { comment: cid } : { }),
      ...(media_timestamp ? { t: media_timestamp } : { })
    }
    return this.create({ subject, element, params, short, proto, from })
  }
  static background(args) {
    const {
      slug,
      colors,
      intensity,
      rotation,
      mode,
      short = this.short,
      proto = this.proto,
      from = undefined
    } = args ?? { }
    let [ element, params ] = [ null, { intensity, rotation, mode } ]
    const cn = colors ? colors.length : 0
    const bg_color = colors ? colors.join(cn < 3 ? '-' : '~') : colors
    if (proto) {
      if (slug && cn) params = { bg_color: bg_color, ...params }
      else if (cn === 1) params = { color: bg_color, ...params }
      else if (cn > 1) params = { gradient: bg_color, ...params }
      if (slug) params = { slug: slug, ...params }
    } else {
      element = slug ?? bg_color
      if (slug) params = { bg_color: bg_color, ...params }
    }
    return this.create({ subject: 'bg', element, params, short, proto, from })
  }
  static settings(type, short = this.short) {
    return this.create({ subject: 'settings', element: type, short, proto: true })
  }

  static #is_property_true(value, field) {
    return value || ((value === undefined || value === null) && this[field])
  }
  static #resolve_subject(dialog_id) {
    return this.#is_natural_numeric(dialog_id) ? `c/${dialog_id}` : dialog_id
  }
  static #is_natural_numeric(data) {
    return /^\d+$/.test(data)
  }
  static #is_integer_numeric(data) {
    return /^(\+|-)?\d+$/.test(data)
  }
  static #integer_numeric(data) {
    if (!this.#is_number_or_string(data)) return
    if (this.#is_integer_numeric(data)) return data
    else return this.#extract_integer(data.toString())
  }
  static #is_number_or_string(data) {
    return [ 'number', 'string' ].includes(typeof data)
  }
  static #extract_integer(data) {
    if (/^(\+|-)?\d+\.\d*$/.test(data)) return data.split('.')[0]
  }
  static #convert_timestamp(ts, to) {
    const us = Object.keys(this.#timestamp_regexps)
    if (!us.includes(to)) return ts
    let time_spot
    for (const unit of us)
      if (time_spot = ts.match(this.#timestamp_regexps[unit])) break
    if (!time_spot) return ts
    let [ h, m, s ] = [
      time_spot[3] ? time_spot[1] ?? 0 : 0,
      time_spot[3] ? time_spot[2] ?? 0 : time_spot[2] ? time_spot[1] : 0,
      time_spot[3] ?? time_spot[2] ?? time_spot[1]
    ]
    const time = h * 3600 + m * 60 + +s
    if (to === 's') return `${time}`;
    [ h, m, s ] = this.#get_hms(time)
    if (to === 'm') return `${(h * 60 + +m).toString().padStart(2, '0')}:${s.padStart(2, '0')}`
    return `${ +h ? `${h}h` : ''}${ +m ? `${m.padStart(2, '0')}m` : ''}${s.padStart(2, '0')}s`
  }
  static #get_hms(seconds) {
    const hours = Math.floor(seconds / 3600)
    seconds %= 3600
    const minutes = Math.floor(seconds / 60)
    return [ hours, minutes, seconds % 60 ].map(value => value.toString())
  }
  static #extract_wallpaper_params(args, slug = null) {
    let params, short, proto,
      rotation, intensity, mode,
      mode_number = 1
    args = Object.values(args)
    if (slug) args = args.slice(1)
    const is_first_array = Array.isArray(args[0])
    let [ colors, rest ] = is_first_array ? [
      args[0], args.slice(1)
    ] : [ structuredClone(args), structuredClone(args) ]
    if (
      typeof colors[0] === 'boolean' || (
        is_first_array &&
        Object.values(this.parameters.mode).includes(colors[0])
      )
    ) { colors = [ ] } else {
      for (let i = 0; i < colors.length + 1; i++) {
        if (!this.#hex_color_regexp.test(colors[i] ?? '')) {
          if (!is_first_array) {
            colors = colors.slice(0, i)
            rest = rest.slice(i)
            break
          } else colors.splice(i, 1)
        }
      }
    }
    if (colors.length === 0) {
      colors = undefined
      if (is_first_array)
        rest = args
      mode_number = 2
    }
    if (!slug) mode_number = 0
    else if (colors) intensity = this.#intensity(rest)
      if (colors?.length === 2) rotation = this.#rotation(rest)
    mode = Array.isArray(rest[0]) ? rest.shift() :
      rest.slice(0, mode_number).map((_, i) => {
        if (this.#extract_boolean(rest))
          if (mode_number === 1 || i === 1)
            return this.parameters.mode.motion
          else return this.parameters.mode.blur
      }).filter(v => v !== undefined)
    short = this.#extract_boolean(rest)
    proto = this.#extract_boolean(rest)
    params = { intensity, rotation, mode }
    return [ slug, { colors: colors, ...params }, short, proto ]
  }
  static #extract_numeric(rest) {
    return this.#integer_numeric(rest.shift())
  }
  static #extract_boolean(rest) {
    return typeof rest[0] === 'boolean' ? rest.shift() : undefined
  }
  static #rotation(rest) {
    const result = this.#extract_numeric(rest)
    if (result !== undefined) return this.#adjust_rotation(result)
  }
  static #intensity(rest) {
    const result = this.#extract_numeric(rest)
    if (result !== undefined) return this.#adjust_intensity(result)
  }
  static #adjust_rotation(rotation, by = 45) {
    return rotation < 0 ? 0 : (Math.round(rotation / by) * by) % 360
  }
  static #adjust_intensity(intensity) {
    return intensity > 100 ? 100 : intensity < -100 ? -100 : intensity
  }

  static user(did, short, proto) {
    let subject, params = { }, from = 'user'
    if (typeof did !== 'string') did = did.toString()
    if (did.match(/^\d+$/)) {
      subject = 'user'
      params = { id: did }
      proto = true
      from = undefined
    } else subject = did
    return this.create({ subject, params, short, proto, from })
  }
  static contact(token, short, proto) {
    return this.create({ subject: 'contact', element: token, short, proto, from: 'contact' })
  }
  static invite(hash, modern = true, short, proto) {
    const prefix = modern ? '+' : 'joinchat/'
    return this.create({ subject: prefix + hash, short, proto, from: 'invite' })
  }
  static folder(slug, short, proto) {
    return this.create({ subject: 'addlist', element: slug, short, proto, from: 'folder' })
  }
  static group(did, short, proto) {
    return this.social({ did, short, proto, from: 'group' })
  }
  static channel(did, short, proto) {
    return this.social({ did, short, proto, from: 'channel' })
  }
  static forum(did, mid, tid, modern, short, proto) {
    return this.message(did, mid, null, tid, null, null, null, modern, short, proto)
  }
  static message(did, mid, cid, tid, single, mt, mt_to, modern, short, proto) {
    return this.social({ did, mid, cid, tid, single, mt, mt_to, modern, short, proto, from: 'message' })
  }
  static share(url, text, short, proto) {
    return this.create({ subject: 'share', params: { url, text }, short, proto, from: 'share' })
  }
  static videochat(did, invite_hash, short, proto) {
    const subject = this.#resolve_subject(did)
    return this.create({ subject, params: { videochat: invite_hash ?? null }, short, proto, from: 'videochat' })
  }
  static livestream(did, invite_hash, short, proto) {
    const subject = this.#resolve_subject(did)
    return this.create({ subject, params: { livestream: invite_hash ?? null }, short, proto, from: 'livestream' })
  }
  static voicechat(did, invite_hash, short, proto) {
    const subject = this.#resolve_subject(did)
    return this.create({ subject, params: { voicechat: invite_hash ?? null }, short, proto, from: 'voicechat' })
  }
  static stickers(slug, short, proto) {
    return this.create({ subject: 'addstickers', element: slug, short, proto, from: 'stickers' })
  }
  static emoji(id, short) {
    return this.create({ subject: 'emoji', params: { id }, short, proto: true })
  }
  static emojis(slug, short, proto) {
    return this.create({ subject: 'addemoji', element: slug, short, proto, from: 'emojis' })
  }
  static story(did, sid, short, proto) {
    const subject = this.#resolve_subject(did)
    return this.create({ subject, element: `s/${sid}`, short, proto, from: 'story' })
  }
  static boost(did, modern = true, short, proto) {
    const rs = this.#resolve_subject(did)
    let subject, element = '', params = { }
    if (rs === did) // public
      if (modern) [ subject, element ] = [ 'boost', did ]
      else [ subject, params ] = [ did, { boost: null } ]
    else
      if (modern) [ subject, params ] = [ rs, { boost: null } ]
      else [ subject, params ] = [ 'boost', { c: did } ]
    return this.create({ subject, element, params, short, proto, from: 'boost' })
  }
  static proxy(server, port, secret, short, proto) {
    const params = { server, port, secret }
    return this.create({ subject: 'proxy', params, short, proto, from: 'proxy' })
  }
  static socks5(...args) {
    return this.socks5proxy(...args)
  }
  static socks5proxy(server, port, user, pass, short, proto) {
    const params = { server, port, user, pass }
    return this.create({ subject: 'socks', params, short, proto, from: 'socks5proxy' })
  }
  static theme(name, short, proto) {
    return this.create({ subject: 'addtheme', element: name, short, proto, from: 'theme' })
  }
  static bg(...args) {
    return this.wallpaper(...args)
  }
  static wallpaper(arg0, arg1, arg2, arg3, arg4, arg5, arg6, short, proto) {
    let element, params = { }
    if (Array.isArray(arg0) || this.#hex_color_regexp.test(arg0))
      [ element, params, short, proto ] = this.#extract_wallpaper_params(arguments)
    else [ element, params, short, proto ] = this.#extract_wallpaper_params(arguments, arg0)
    return this.background({ slug: element, ...params, short, proto, from: 'wallpaper' })
  }
  static bot(bot, entity, id, startgroup, startchannel, admin, short, proto) {
    if (startgroup === true) [ startchannel, admin, short, proto ] = [ false, startchannel, admin, short ]
    else if (entity === true) [ entity, id, startgroup, startchannel, admin, short, proto ] = [
      null, null, false, true, Array.isArray(id) ? id : Object.values(this.parameters.admin), startgroup, startchannel
    ]
    const launch = startgroup ? 'startgroup' : startchannel ? 'startchannel' : null
    if (startchannel) entity = id = null; else if (typeof admin === 'string') admin = [ admin ]
    return this.create({ subject: bot, entity, id, params: { admin }, launch, attach: null, short, proto, from: 'bot' })
  }
  static game(bot, game, short, proto) {
    return this.create({ subject: bot, params: { game: game }, short, proto, from: 'game' })
  }
  static change_number(short) {
    return this.settings('change_number', short)
  }
  static devices(short) {
    return this.settings('devices', short)
  }
  static folders(short) {
    return this.settings('folders', short)
  }
  static languages(short) {
    return this.settings('language', short)
  }
  static privacy(short) {
    return this.settings('privacy', short)
  }
  static auto_delete(short) {
    return this.settings('auto_delete', short)
  }
  static edit_profile(short) {
    return this.settings('edit_profile', short)
  }
  static themes(short) {
    return this.settings('themes', short)
  }
  static login(code, token, short, proto) {
    if (!code && token) proto = true
    const [ element, params ] = proto ? [ null, { code, token } ] : [ code, { } ]
    return this.create({ subject: 'login', element, params, short, proto, from: 'login' })
  }
  static invoice(slug, modern = true, short, proto) {
    const [ subject, element ] = modern ? [ `\$${slug}`, null ] : [ 'invoice', slug ]
    return this.create({ subject, element, short, proto, from: 'invoice' })
  }
  static language(slug, short, proto) {
    return this.create({ subject: 'setlanguage', element: slug, short, proto, from: 'language' })
  }
  static passport(params, modern = true, short) {
    if (!modern) params = { domain: 'telegrampassport', ...params }
    return this.create({ subject: modern ? 'passport' : 'resolve', params, short, proto: true })
  }
  static confirm_phone(phone, hash, short, proto) {
    if (typeof phone !== 'string') phone = phone.toString()
    if (this.#number_regexp.test(phone)) phone = phone.substring(1)
    return this.create({ subject: 'confirmphone', params: { phone, hash }, short, proto })
  }
  static premium(type, data, short, proto = this.proto) {
    type = ([
      null,
      'giftcode',
      'offer',
      'multigift'
    ][type]) ?? (type === true ? 'giftcode' : type)
    if (type.startsWith('premium_')) type = type.split('_')[1]
    const is_giftcode = type === 'giftcode'
    if (!is_giftcode) proto = true
    const subject = is_giftcode ? type : `premium_${type}`
    const [ element, params ] = !proto ? [ data, null ] :
      [ null, { [ is_giftcode ? 'slug' : 'ref' ]: data } ]
    return this.create({ subject, element, params, short, proto })
  }
  static app(bot, app, entity, id, compact = false, user, choose, launch, attach = false, short, proto) {
    if (app === true) [ app, attach ] = [ null, true ]
    if (Array.isArray(user)) [ user, choose ] = [ null, user ]
    const params = { ...(compact ? { mode: this.parameters.mode.compact } : { }), ...(choose ? { choose } : { }) }
    if (typeof launch !== 'boolean' && !attach && !app)
      launch = entity || !user ? this.operations[user ? 'startattach' : 'startapp'] : null
    return this.create({ subject: bot, element: app, entity, id, params, user, launch, attach, short, proto, from: 'app' })
  }
}
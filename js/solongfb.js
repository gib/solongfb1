/**
 * So Long, Facebook
 *
 * The effect I'm going for--when the page loads, a grid of public Facebook posts
 * radomly fades in one by one at an increasing rate until the entire grid is full.
 * Once the grid is full, show some text.  
 *
 * Facebook search borrows heavily from http://www.openbook.org
 * Copyright 2010
 */
$(function() {
  // Local vars
  var $fb_live = $('#fb-live');
  var section_width = 200;
  var section_height = 200;

  // Start the show!
  window.setTimeout(function() {
    $fb_live.trigger('kick_start');
  }, 1);

  // Set up an object to track the state of things
  var state = {
    width:          $(window).width(),
    height:         $fb_live.outerHeight(true),
    columns:        Math.ceil($(window).width() / section_height),
    rows:           Math.ceil($fb_live.outerHeight(true) / section_width),
    post_max_len:   180,
    section_width:  section_width,
    section_height: section_height,
    url:            'https://graph.facebook.com/search?callback=?',
    next:           '',
    search_this:    'the',
    attempts:       0,
    duration:       3000,
    timeout:        null,
    results:        [],
    order:          [],
    first_fill:     true,
    final_say:      ['.','.',' ','I',' ','d','o','n','\'','t',' ','t','h','i','n','k',' ','I','\'','l','l',' ','m','i','s','s',' ','i','t','.'],
    get_size:       function() { return this.rows * this.columns; },
    set_columns:    function() { 
                      this.columns = Math.ceil(this.width / this.section_height); 
                    },
    set_order:      function() { 
                      for (i = 0; i < this.get_size(); i++) {
                        this.order[i] = i;
                      }
                      // shuffle the order
                      this.order.sort(function() { 
                        var num = Math.floor(Math.random() * 2); // 0, 1
                        if (num === 0) { return -1; }
                        return 1;
                      });
                    },
    get_dims:       function(index) { 
                      var dims = { 'left': '0px', 'top': '0px' };
                      if (index > 0) {
                        var t = Math.ceil(index % this.rows);
                        var l = Math.ceil((index - t) / this.rows);
                        dims.left = (this.section_width * l) + 'px';
                        dims.top = (this.section_height * t) + 'px';
                      }
                      return dims;
                    },
    post_html:      ['<div id="~POST_ID~" class="floats post" ',
                     'style="background-image:url(http://graph.facebook.com/~ID~/picture?type=large);">',
                     '  <div class="msg">',
                     '    <p>~MSG~</p>',
                     '    <div class="ft">',
                     '      <em class="who">~NAME~</em>',
                     '      <em>~FROM~</em>',
                     '      <div class="time">~TIME~</div>',
                     '    </div>',
                     '  </div>',
                     '</div>'].join('\n'),
    markup_post:  function(post,user) {
                      if (!user) { return; }
                      var msg = this.format_post(post);
                      return this.post_html 
                        .replace(/~POST_ID~/g,  post.id)
                        .replace(/~ID~/g,       post.from.id)
                        .replace(/~NAME~/g,     post.from.name)
                        .replace(/~TIME~/g,     get_relative_timestamp(post.created_time))
                        .replace(/~FROM~/g,     (user.location && user.location.name) || '')
                        .replace(/~MSG~/g,      msg);  // MUST BE LAST
                    },
    format_post:    function(post) {
                      var body = $.map(['message','caption','description','name'],function(prop) {return post[prop] || '';}).join(' ');
                      if (body.length > this.post_max_len) {
                        body = body.slice(0, this.post_max_len - 3) + '...';
                      }
                      return body.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
                    }
    // search_these: [],
    // get_rand_search: function() {
    //  return this.search_these[Math.floor(Math.random() * this.search_these.length)];
    // }
  };


  //
  // Events
  //
  $fb_live.bind('kick_start', function(evnt) {
    state.width = $(window).width();
    state.set_columns();
    state.set_order();
    $fb_live
      .css('width', state.width+'px')
      .trigger('get_posts');
  });

  // window resize
  $(window).resize(function() {
    $fb_live.css('width', $(window).width());
  });

  // Grid is full
  $fb_live.bind('final_say', function(evnt) {
    $('#adios-fb .circle').fadeIn('slow');
    state.final_say = state.final_say.reverse();
    var $sub = $('article.page .why h6');
    var type_final_say = function() {
      if (state.final_say.length === 0) { return; }
      var ins = state.final_say.pop() + ')';
      var txt = jQuery.trim($sub.text());
      $sub.text(txt.substring(0,txt.length-1) + ins);
      window.setTimeout(type_final_say, 200);
    };
    type_final_say();
  });

  // Handle requests for new fb posts
  $fb_live.bind('get_posts', function(evnt) {
    // Perform the fb search
    var url = state.url;
    var params = {'q':state.search_this, 'type':'post'};
    if (state.next) { // next page
      url = state.next;
      params = {};
    }
    if (state.attempts > 2) {
      // FB is not responding...
      $fb_live.trigger('final_say');
      return;
    }
    $.getJSON(url, params, function(posts) {
      state.attempts++;
      if (posts.paging && posts.paging.previous) {
        state.url = posts.paging.previous + '&callback=?';
      }
      var userids = $.map(posts.data,function(post) { 
        if (post && post.from) {
          return post.from.id; 
        }
      });
      var url = 'http://graph.facebook.com/?ids=' + userids.join(',') + '&callback=?';
      $.getJSON(url, {}, function(users) {
        $.each(posts.data,function(_,post) {
          state.results.push({ 
            id: post.id 
          });
          $fb_live.append(state.markup_post(post, users[post.from.id]));
        });
        // need more?
        if (state.results.length < state.get_size()) {
          $fb_live.trigger('get_posts');
        }
        else {
          // Trigger the post display
          state.results.reverse();
          $fb_live.trigger('display_post');
        }
      });
    });
  });

  $fb_live.bind('display_post', function(evnt) {
    if (state.order.length === 0) { 
      if (state.first_fill) {
        state.first_fill = false;
        $fb_live.trigger('final_say');
      }
      $fb_live.trigger('kick_start');
      return; 
    }

    var i = state.order.pop();
    Math.floor(Math.random() * state.get_size());

    var result = state.results.pop();
    var speed = 'slow';
    if (!state.first_fill) {
      speed = 'fast';
    }
    var $result = $fb_live.find('#'+result.id);
    $fb_live.find('#'+result.id)
      .css('display','none')
      .css(state.get_dims(i))
      .fadeIn(speed);

    state.timeout = window.setTimeout(function() { 
      var new_dur = state.duration - 200;
      state.duration = Math.max(1000, new_dur);
      $fb_live.trigger('display_post');
    }, state.duration);
  });

  //
  // Utility Methods
  //
  var get_relative_timestamp = function(timestamp) {
    var c = new Date();
    var t = iso2date(timestamp);
    //t = new Date( ( timestamp || '').replace(/-/g,'/').replace(/[TZ]/g,' '));

    var d = c.getTime() - t.getTime();
    var dY = Math.floor(d / (365 * 30 * 24 * 60 * 60 * 1000));
    var dM = Math.floor(d / (30 * 24 * 60 * 60 * 1000));
    var dD = Math.floor(d / (24 * 60 * 60 * 1000));
    var dH = Math.floor(d / (60 * 60 * 1000));
    var dN = Math.floor(d / (60 * 1000));

    if (dY > 0)   { return dY === 1? "1 year ago"   : dY + " years ago"; }
    if (dM > 0)   { return dM === 1? "1 month ago"  : dM + " months ago"; }
    if (dD > 0)   { return dD === 1? "1 day ago"    : dD + " days ago"; }
    if (dH > 0)   { return dH === 1? "1 hour ago"   : dH + " hours ago"; }
    if (dN > 0)   { return dN === 1? "1 minute ago" : dN + " minutes ago"; }
    return "less than a minute ago";
  };

  // from http://delete.me.uk/2005/03/iso8601.html
  var iso2date = function(string) {
    var regexp = "([0-9]{4})(-([0-9]{2})(-([0-9]{2})" +
    "(T([0-9]{2}):([0-9]{2})(:([0-9]{2})(\.([0-9]+))?)?" +
    "(Z|(([-+])([0-9]{2}):([0-9]{2})))?)?)?)?";
    var d = string.match(new RegExp(regexp));

    var offset = 0;
    var date = new Date(d[1], 0, 1);

    if (d[3]) { date.setMonth(d[3] - 1); }
    if (d[5]) { date.setDate(d[5]); }
    if (d[7]) { date.setHours(d[7]); }
    if (d[8]) { date.setMinutes(d[8]); }
    if (d[10]) { date.setSeconds(d[10]); }
    if (d[12]) { date.setMilliseconds(Number("0." + d[12]) * 1000); }
    if (d[14]) {
      offset = (Number(d[16]) * 60) + Number(d[17]);
      offset *= ((d[15] === '-') ? 1 : -1);
    }

    offset -= date.getTimezoneOffset();
    var time = (Number(date) + (offset * 60 * 1000));
    var result = new Date();
    result.setTime(Number(time));
    return result;
  };

});

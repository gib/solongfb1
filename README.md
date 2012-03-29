# So Long, and Thanks for All the Pokes #1

Facebook has some amazing tech and is clearly a great platform. It just isn't for me.
Once I deleted my account I wanted to mark the occasion.

Inspired by [David Desandro](http://desandro.com), I created a Facebook mark out of HTML and CSS.
Specifically his [Curtis CSS Typfase](http://desandro.com/resources/curtis-css-typeface/) and 
[Opera logo with CSS](http://desandro.com/articles/opera-logo-css/) were great assets.
I'm a huge fan of his work.

[_So Long, and Thanks for All the Pokes #1_](http://shortforgilbert.com/experiments/solongfb1)
[source](http://github.com/gib/solongfb1)


## The Facebook Mark Markup

```html
  <span class='fb'>
    <span class='highlight-top'></span>
    <span class='highlight-bottom'></span>
    <span class='f'>
      <span class='arc'>
        <span class='arc-cap'></span>
      </span>
      <span class='cross'>
        <span class='cross-cap'></span>
      </span>
      <span class='bd'></span>
    </span>
  </span>
  <span class='brand-shine'></span>
```

Check out the CSS in `css/solongfb.css` or using in your browser's inspect element option.

The JavaScript is not my best work, but hopefully read-able, see `js/solongfb.js`. The next experiment will have some modularity.

## The Content

I borrowed from Openbook.org to pull recent public Facebook posts using the open "social graph" API.


## Footnotes

* [Facebook Is Lame](http://facebookislame.com/?sort=&amp;search=facebook)
* [Six Reasons Why I’m Not On Facebook, By Wired UK’s Editor](http://www.wired.com/epicenter/2010/09/six-reasons-why-wired-uks-editor-isnt-on-facebook) _David Rowan, Wired UK, September 18, 2010_
* [Farewell, Facebook. You Knew Me a Little Too Well](http://www.npr.org/templates/story/story.php?storyId=17551764) _Melody Kramer, National Public Radio, December 22, 2007_
* [Openbook.org](http://www.openbook.org)
* [Oh Crap. My Parents Joined Facebook.] (http://myparentsjoinedfacebook.com)
* [How To Permanently Delete Your Facebook Account](http://www.facebook.com/group.php?gid=16929680703) _Magnus_

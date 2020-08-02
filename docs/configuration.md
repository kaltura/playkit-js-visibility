## Configuration

Visibility plugin configuration parameters are provided whenever a player instance is created.

```js
var config = {
  plugins: {
    visibility: {
      // Visibility configuration here
    }
  }
};
var player = KalturaPlayer.setup(config);
```

#### Configuration Structure

The configuration uses the following structure:

```js
{
  threshold: number,
  floating: Object // optional
}
```

#### Default Configuration Values

```js
{
    threshold: 50,
    floating: {  // default floating values - if floating is configured
        position: 'bottom-right',
        height: '225',
        width: '400',
        marginX: '20',
        marginY: '20',
        dismissible: true,
        draggable: true
      }
}
```
##

> ### config.threshold
>
> ##### Type: `number`
>
> ##### Default: `50`
>
> ##### Description: The minimum player visible area percentage to consider as visible
>

##

> ### config.floating
>
> ##### Type: `Object`
>
> ##### Default: `-`
>
> ##### Description: Defines the floating player configuration
> When a viewer scrolls the player out of view, a floating player would pop-up and position itself following the configuration. This allows the viewer to engage with both the video content and the site content.
##
> > ### config.floating.position
> >
> > ##### Type: `string`
> >
> > ##### Default: `bottom-right`
> >
> > ##### Description: The position where the floating player will be displayed
> > Possible values: `"bottom-right", "bottom-left", "top-right", "top-left"
> >##
> > ### config.floating.dismissible
> >
> > ##### Type: `boolean`
> >
> > ##### Default: `true`
> >
> > ##### Description: When set to true, viewer will be able to dismiss the floating player so that it doesn’t appear anymore while he scrolls the current page
> >
##
> > ### config.floating.draggable
> >
> > ##### Type: `boolean`
> >
> > ##### Default: `true`
> >
> > ##### Description: When set to true, viewer will be able to drag the floating player. Uncheck if you want to have a fixed location for the floating player
> >
##
> > ### config.floating.height
> >
> > ##### Type: `number`
> >
> > ##### Default: `225`
> >
> > ##### Description: The height of the floating player in pixels
> >
##
> > ### config.floating.width
> >
> > ##### Type: `number`
> >
> > ##### Default: `400`
> >
> > ##### Description: The width of the floating player in pixels
> >
##
> > ### config.floating.marginX
> >
> > ##### Type: `number`
> >
> > ##### Default: `20`
> >
> > ##### Description: The margin, in pixels, from the selected edge, on the X-Axis
> >
##
> > ### config.floating.marginY
> >
> > ##### Type: `number`
> >
> > ##### Default: `20`
> >
> > ##### Description: The margin, in pixels, from the selected edge, on the Y-Axis
> >

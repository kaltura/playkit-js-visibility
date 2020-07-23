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
  threshold: number;
  floating: {
        height: number,
        width: number,
        marginX: number,
        marginY: number,
        dismissible: boolean
  }
}
```

#### Default Configuration Values

```js
{
  threshold: 50;
}
```

#### Default floating Configuration Values

```js
{
  floating: {
    position: 'bottom-right',
    height: 225,
    width: 400,
    marginX: 0,
    marginY: 0,
    dismissible: true
  }
}
```

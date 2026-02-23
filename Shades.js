//  Copyright ©️ 2026 Stewart Smith. See LICENSE for details.

import {

	isUsefulNumber,
	isNotUsefulNumber,
	isUsefulInteger,
	isUsefulString,
	isNotUsefulString,
	isNotArray,
	mapRange,
	Range

} from 'snacks-js'


const VERSION = '0.0.1'
/*




COLORS

What makes this different than (most) other JavaScript Color classes?
We insist on tracking a “native color model” for each instance
so that all conversions, tweens, equalities 
are determined from its own perspective, 
rather than, say, converting to RGB inbetween. 
(Although for CMYK, RGB is a very sensible pass-through.)




IMPORTING

If you’re just juggling colors,
all you’ll need to import is { Color } like so:
import { Color } from 'color-js'

But if you’d like to use the convenience functions, 
you’ll have to import each one à la carte:
import { RGB, RGBA, HSL, HSLA, HSB, HSBA, CMYK } from 'color-js'

For a complete list of importable objects,
see the `export` command below.
*/




function demo(){




	//  Basic color creation
	//  and convenience methods.

	var cyan = new Color( 'HSL', 175, 100, 50 )
	console.log( '\n\nThis is an HSL color we’ll call “cyan”:' )
	cyan.log()
	var alsoCyan = HSL( 175, 100, 50 )
	console.log( 'And here it is again, \nbut using the `HSL(…)` convenience method instead of `new Color(…)`:' )
	alsoCyan.log()

	var green = new Color( 'RGB', 0, 0x99, 0 )
	console.log( '\nHere’s an RGB color we’ll call “green”:' )
	green.log()
	var alsoGreen = RGB( 0, 0x99, 0 )
	console.log( 'And here it is again, \nbut using the `RGB(…)` convenience method instead of `new Color(…)`:' )
	alsoGreen.log()

	//  Note how out-of-range values are handled:
	//  Hue is _wrapped_ from 0˚ to 360˚
	//  while Saturation and Lightness are _clamped_ from 0..100.

	console.log( '\n\nNote how these input values have been wrapped and clamped:' )
	var salmonHSL = HSL( 370, 999, 80, -999, 999 )
	salmonHSL.log()




	//  RGB and RGBA support hex input,
	//  both as Strings and Numbers.

	console.log( '\n\nThere are many ways to use hex as RGB input:' )

	//  Short forms.

	RGB(  ' FC3'  ).log( ` 'FC3' ` )
	RGBA( ' FC36' ).log( ` 'FC36'` )
	RGB(  '#FC3'  ).log( `'#FC3' ` )
	RGBA( '#FC36' ).log( `'#FC36'` )

	//  Long forms. 

	RGB(  ' FFCC33'   ).log( ` 'FFCC33'  ` )
	RGBA( ' FFCC3366' ).log( ` 'FFCC3366'` )
	RGB(  '#FFCC33'   ).log( `'#FFCC33'  ` )
	RGBA( '#FFCC3366' ).log( `'#FFCC3366'` )

	//  These aren’t Strings, they’re Numbers!

	RGB(  0xFC3  ).log( `Sorry: Number( 0xFC3 ) format isn’t supported.` )
	RGBA( 0xFC36 ).log( `Sorry: Number( 0xFC36 ) format isn’t supported.` )
	RGB(  0xFFCC33   ).log( `0xFFCC33  ` )
	RGBA( 0xFFCC3366 ).log( `0xFFCC3366` )

	//  If for some reason you want to send hex values
	//  separately for each channel...

	RGB(  0xFF, 0xCC, 0x33 ).log( `0xFF, 0xCC, 0x33` )
	RGBA( 0xFF, 0xCC, 0x33, 0x66 ).log( `0xFF, 0xCC, 0x33, 0x66` )




	//  Conversions between color models.

	console.log( '\n\nLet’s make a color and translate it to various models:' )
	salmonHSL.log()
	var salmonConverted = salmonHSL
		.toHSLA().log()
		.toHSB().log()
		.toHSBA().log()
		.toRGB().log()
		.toRGBA().log()
		.toHSBA().log()
		.toCMYK().log()
		.toHSL().log()//  Back to HSL.
	salmonConverted.log( '(Many conversions later)' )
	console.log( 'Result values:', salmonConverted )
	console.log( 'Are they still equal?', salmonHSL.isEqualTo( salmonConverted, 0.1 ))
	console.log( 'How dissimilar are they?', salmonHSL.distanceTo( salmonConverted ))




	//  Presentation methods,
	//  dependent on color model.

	var saffronHSL = HSL( 45, 100, 50 )
	saffronHSL.as( 'css' )
	saffronHSL.toRGB().as( 'hex' )
}







    ////////////////////
   //                //
  //   Converters   //
 //                //
////////////////////


//  Decimal ←→ Hexadecimal

function decToHex( a ){

	if( isUsefulNumber( a )) a = [ a ]
	if( isNotArray( a )) return null
	return '#'+ a.map( x => {

		const hex = Math.round( x ).toString( 16 )//.toUpperCase()
		return hex.length === 1 ? '0'+ hex : hex

	}).join( '' )
}
function hexToDec( a ){

	return parseInt( a, 16 )
}


//  RGB ←→ HSL.

function rgbToHsl( r, g, b ){

	r /= 255
	g /= 255
	b /= 255

	const
	min = Math.min( r, g, b ),
	max = Math.max( r, g, b )
	
	let h, s, l = ( max + min ) / 2
	if( max === min ){
	

		//  Achromatic (grey).
		//  I don’t love that when saturation hits 0,
		//  hue becomes 0 by convention. 
		//  I’ve been tempted to set hue to 
		//  some other value in this case,
		//  just to be cheeky. 

		h = s = 0
	}
	else {
	
		const d = max - min
		s = l > 0.5 ? d / ( 2 - max - min ) : d / ( max + min )
		switch( max ){

			case r: h = ( g - b ) / d + ( g < b ? 6 : 0 ); break
			case g:	h = ( b - r ) / d + 2; break
			case b: h = ( r - g ) / d + 4; break
		}
		h /= 6
	}
	return [ h * 360, s * 100, l * 100 ]
}
function hslToRgb( h, s, l ){
  
	s /= 100
	l /= 100

	const 
	k = n => ( n + h / 30 ) % 12,
	a = s * Math.min( l, 1 - l ),
	f = n => l - a * Math.max( -1, Math.min( k( n ) - 3, Math.min( 9 - k( n ), 1 )))

	return [

		f( 0 ) * 255,
		f( 8 ) * 255,
		f( 4 ) * 255
	]
}


//  RGB ←→ HSB.

function rgbToHsb( r, g, b ){

	r /= 255
	g /= 255
	b /= 255

	const 
	v = Math.max( r, g, b ),
	n = v - Math.min( r, g, b ),
	h = n === 0 
		? 0 
		: n && v === r 
			? ( g - b ) / n 
			: v === g 
				? 2 + ( b - r ) / n 
				: 4 + ( r - g ) / n,
	hue = 60 * ( h < 0 ? h + 6 : h ),
	saturation = v && ( n / v ) * 100,
	brightness = v * 100

	return [ hue, saturation, brightness ]
}
function hsbToRgb( h, s, b ){

	h /= 360
	s /= 100
	b /= 100
	
	let r, g, blue
	
	const 
	i = Math.floor( h * 6 ),
	f = h * 6 - i,
	p = b * ( 1 - s ),
	q = b * ( 1 - f * s ),
	t = b * ( 1 - ( 1 - f ) * s )
	
	switch( i % 6 ){

		case 0: r = b, g = t, blue = p; break
		case 1: r = q, g = b, blue = p; break
		case 2: r = p, g = b, blue = t; break
		case 3: r = p, g = q, blue = b; break
		case 4: r = t, g = p, blue = b; break
		case 5: r = b, g = p, blue = q; break
	}
	return [ r * 255, g * 255, blue * 255 ]
}


//  HSL ←→ HSB.

function hsbToHsl( h, s, b ){
	
	s /= 100
	b /= 100
	let l = ( 2 - s ) * b / 2
	if( l !== 0 && l !== 1 ){

		s = b * s / ( l < 0.5 ? l * 2 : 2 - l * 2 )
	}
	else s = 0
	s *= 100
	l *= 100
	return [ h, s, l ]
	// return [ 90, 100, 50 ]
}
function hslToHsb( h, s, l ){

	s /= 100
	l /= 100

	const 
	hsbB = l + s * Math.min( l, 1 - l ),
	hsbS = hsbB === 0 ? 0 : 2 * ( 1 - l / hsbB )

	return [ h, hsbS * 100, hsbB * 100 ]
}


//  RGB ←→ CMYK.

function rgbToCmyk( r, g, b ){

	if( r + g + b === 0 ) return [ 0, 0, 0, 1 ]//  Black.
	r /= 255
	g /= 255
	b /= 255

	const
	k = 1 - Math.max( r, g, b ),
	z = 1 - k,
	c = ( 1 - r - k ) / z || 0,//  Handle division by zero.
	m = ( 1 - g - k ) / z || 0,
	y = ( 1 - b - k ) / z || 0

	return [ c * 100, m * 100, y * 100, k * 100 ]
}
function cmykToRgb( c, m, y, k ){

	c /= 100
	m /= 100
	y /= 100
	k /= 100

	const
	z = 1 - k,
	r = 255 * ( 1 - c ) * z,
	g = 255 * ( 1 - m ) * z,
	b = 255 * ( 1 - y ) * z

	return [ r, g, b ]
}


//  ’Lil range wrap helper.

function channelDelta( a, b, range ){

	if( !range.isWrapped ) return Math.abs( a - b )
	const diff = Math.abs( range.wrap( a ) - range.wrap( b ) )
	return diff > range.span / 2 ? range.span - diff : diff
}






    //////////////////////
   //                  //
  //   Color models   //
 //                  //
//////////////////////


const colorModels = {

	RGB: {

		channels: {

			r: new Range( 0, 255 ),
			g: new Range( 0, 255 ),
			b: new Range( 0, 255 )
		},
		converters: {

			RGB:  ( c )=> c.clone(),
			RGBA: ( c )=> new Color( 'RGBA', ...c.channels, 255 ),

			HSL:  ( c )=> new Color( 'HSL',  ...rgbToHsl( ...c.channels )),
			HSLA: ( c )=> new Color( 'HSLA', ...rgbToHsl( ...c.channels ), 100 ),
			
			HSB:  ( c )=> new Color( 'HSB',  ...rgbToHsb( ...c.channels )),
			HSBA: ( c )=> new Color( 'HSBA', ...rgbToHsb( ...c.channels ), 100 ),
			
			CMYK: ( c )=> new Color( 'CMYK', ...rgbToCmyk( ...c.channels ))
		},
		presenters: {

			css: ( c )=> `rgb(${ c.channels.join( ' ' )})`,
			hex: ( c )=> decToHex( c.channels )
		}
	},
	RGBA: {

		channels: {
			
			r: new Range( 0, 255 ),
			g: new Range( 0, 255 ),
			b: new Range( 0, 255 ),
			a: new Range( 0, 255 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...c.channels ),
			RGBA: ( c )=> c.clone(),

			HSL:  ( c )=> new Color( 'HSL',  ...rgbToHsl( ...c.channels )),
			HSLA: ( c )=> new Color( 'HSLA', ...rgbToHsl( ...c.channels ), mapRange( 0, 255, 0, 100, c.channels[ 3 ])),

			HSB:  ( c )=> new Color( 'HSB',  ...rgbToHsb( ...c.channels )),
			HSBA: ( c )=> new Color( 'HSBA', ...rgbToHsb( ...c.channels ), mapRange( 0, 255, 0, 100, c.channels[ 3 ])),

			CMYK: ( c )=> new Color( 'CMYK', ...rgbToCmyk( ...c.channels ))
		},
		presenters: {

			css: ( c )=> `rgb(${ c.channels.slice( 0, 3 ).join( ' ' )} / ${ c.channels[ 3 ] / 255 })`,
			hex: ( c )=> decToHex( c.channels )
		}
	},
	HSL: {

		channels: {
		
			h: new Range( 0, 360, true ),
			s: new Range( 0, 100 ),
			l: new Range( 0, 100 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...hslToRgb( ...c.channels )),
			RGBA: ( c )=> new Color( 'RGBA', ...hslToRgb( ...c.channels ), 255 ),
			
			HSL:  ( c )=> c.clone(),
			HSLA: ( c )=> new Color( 'HSLA', ...c.channels, 100 ),
			
			HSB:  ( c )=> new Color( 'HSB',  ...hslToHsb( ...c.channels )),
			HSBA: ( c )=> new Color( 'HSBA', ...hslToHsb( ...c.channels ), 100 ),
			
			CMYK: ( c )=> c.to( 'RGB' ).to( 'CMYK' )
		},
		presenters: {

			css: ( c )=> `hsl(${ c.channels.join( ' ' )})`,
		}
	},
	HSLA: {

		channels: {
		
			h: new Range( 0, 360, true ),
			s: new Range( 0, 100 ),
			l: new Range( 0, 100 ),
			a: new Range( 0, 100 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...hslToRgb( ...c.channels )),
			RGBA: ( c )=> new Color( 'RGBA', ...hslToRgb( ...c.channels ), mapRange( 0, 100, 0, 255, c.channels[ 3 ])),
			
			HSL:  ( c )=> new Color( 'HSL',  ...c.channels ),
			HSLA: ( c )=> c.clone(),
			
			HSB:  ( c )=> new Color( 'HSB',  ...hslToHsb( ...c.channels )),
			HSBA: ( c )=> new Color( 'HSBA', ...hslToHsb( ...c.channels )),

			CMYK: ( c )=> c.to( 'RGB' ).to( 'CMYK' )
		},
		presenters: {

			css: ( c )=> `hsl(${ c.channels.slice( 0, 3 ).join( ' ' )} / ${ c.channels[ 3 ] / 100 })`,
		}
	},


	//  If HSV and HSB are equivalent, 
	//  what tipped the scales toward using the “HSB” label? 
	//  Well... This is primarily here to deal with Adobe’s stupidity;
	//  Illustrator does not natively support HSL, only “HSB”
	//  which is annoying when doing any sort of hue-based colorwork
	//  that it aimed at the Web browser.
	//  This tool helps a bit by making conversion easy.

	HSB: {

		channels: {
		
			h: new Range( 0, 360, true ),
			s: new Range( 0, 100 ),
			b: new Range( 0, 100 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...hsbToRgb( ...c.channels )),
			RGBA: ( c )=> new Color( 'RGBA', ...hsbToRgb( ...c.channels ), 255 ),

			HSL:  ( c )=> new Color( 'HSL',  ...hsbToHsl( ...c.channels )),
			HSLA: ( c )=> new Color( 'HSLA', ...hsbToHsl( ...c.channels ), 100 ),

			HSB:  ( c )=> c.clone(),
			HSBA: ( c )=> new Color( 'HSBA', ...c.channels, 100 ),

			CMYK: ( c )=> c.to( 'RGB' ).to( 'CMYK' )
		},
		presenters: {}
	},
	HSBA: {

		channels: {
		
			h: new Range( 0, 360, true ),
			s: new Range( 0, 100 ),
			b: new Range( 0, 100 ),
			a: new Range( 0, 100 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...hsbToRgb( ...c.channels )),
			RGBA: ( c )=> new Color( 'RGBA', ...hsbToRgb( ...c.channels.slice( 0, 3 )), c.channels[ 3 ]),

			HSL:  ( c )=> new Color( 'HSL',  ...hsbToHsl( ...c.channels )),
			HSLA: ( c )=> new Color( 'HSLA', ...hsbToHsl( ...c.channels.slice( 0, 3 )), c.channels[ 3 ]),

			HSB:  ( c )=> new Color( 'HSB',  ...c.channels ),
			HSBA: ( c )=> c.clone(),

			CMYK: ( c )=> c.to( 'RGB' ).to( 'CMYK' )
		},
		presenters: {}
	},
	CMYK: {

		channels: {
		
			c: new Range( 0, 100 ),
			m: new Range( 0, 100 ),
			y: new Range( 0, 100 ),
			k: new Range( 0, 100 )
		},
		converters: {

			RGB:  ( c )=> new Color( 'RGB',  ...cmykToRgb( ...c.channels )),
			RGBA: ( c )=> new Color( 'RGBA', ...cmykToRgb( ...c.channels ), 255 ),
			
			HSL:  ( c )=> c.to( 'RGB' ).to( 'HSL' ),
			HSLA: ( c )=> c.to( 'RGB' ).to( 'HSLA' ),
			
			HSB:  ( c )=> c.to( 'RGB' ).to( 'HSB' ),
			HSBA: ( c )=> c.to( 'RGB' ).to( 'HSBA' ),
			
			CMYK: ( c )=> c.clone()
		},
		presenters: {

			//  https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/Values/color_value/device-cmyk
			css: ( color )=> `device-cmyk(${ color.channels[ 0 ]}% ${ color.channels[ 1 ]}% ${ color.channels[ 2 ]}% ${ color.channels[ 3 ]}% )`,
		}
	}
}






    ///////////////
   //           //
  //   Color   //
 //           //
///////////////


class Color {

	constructor( modelName, ...channels ){

		if( isNotUsefulString( modelName )){
		
			console.warn( `The provided color model name was not a useful String: ${ modelName }.` )
			return null
		}
		modelName = modelName.toUpperCase()
		if( modelName === 'RGB' || modelName === 'RGBA' ){

			if( channels.length === 1 ){

				if( isUsefulNumber( channels[ 0 ])){

					const n = channels[ 0 ]
					if( modelName === 'RGB' ){

						const 
						r = ( n >> 16 ) & 0xFF, // 0x12
						g = ( n >>  8 ) & 0xFF, // 0x34
						b = n & 0xFF            // 0x56

						channels = [ r, g, b ]
					}
					else if( modelName === 'RGBA' ){

						const
						r = ( n >> 24 ) & 0xFF, // 0x12
						g = ( n >> 16 ) & 0xFF, // 0x34
						b = ( n >>  8 ) & 0xFF, // 0x56
						a = n & 0xFF            // 0x78

						channels = [ r, g, b, a ]
					}
				}
				else if( isUsefulString( channels[ 0 ])){

					const 
					raw = channels[ 0 ].trim(),
					hex = raw.startsWith( '#' )
						? raw.slice( 1 )
						: raw

					switch( hex.length ){

						case 3: 
							channels = hex.split( '' )
							.map( function( s ){ 
								
								return hexToDec( s + s )
							})
							break

						case 4: 
							channels = hex.split( '' )
							.map( function( s ){ 
								
								return hexToDec( s + s )
							})
							break

						case 6:
							channels = hex.match( /.{1,2}/g ).map( hexToDec )
							break

						case 8: 
							channels = hex.match( /.{1,2}/g ).map( hexToDec )
							break

						default:
							console.warn( `Invalid hex input:`, channels )
							return null
							break
					}
				}
				else {

					console.warn( `Was expecting this argument to be a String or Number:`, channel[ 0 ] )
					return null
				}
			}
			else {

				channels = channels
				.map( function( c ){

					if( isUsefulString( c )) return c.toString( 16 )
					if( isUsefulNumber( c )) return c
					console.warn( `Was expecting this argument to be a String or Number:`, c )
					return null
				})
			}
		}


		this.modelName = modelName
		this.model = colorModels[ modelName ]
		if( !this.model ){
		
			console.warn( `The provided color model name does not appear to be supported: ${ modelName }.` )
			return null
		}


		//  This routine ensures that 
		//  each channel value is within range
		//  and we aren’t tracking superfluous channel data
		// (like when down-converting RGBA to RGB, for example).

		const scope = this
		this.channels = Object.entries( this.model.channels )
		.map( function([ key, range ], i ){

			const n = 
				range.isWrapped
				? range.wrap(  channels[ i ])
				: range.clamp( channels[ i ])


			//  While we’re here,
			//  let’s drop convenience accessors!
			// (Purely for human readability -- no computation done on these.)

			scope[ key ] = n


			//  And get back to our normal business
			//  of populating this color’s channels array.
			// (This is what actual computation uses.)

			return n
		})
	}
	clone(){

		return new Color( this.modelName, ...this.channels )
	}
	to( modelName ){

		if( isNotUsefulString( modelName )) modelName = 'RGB'
		modelName = modelName.toUpperCase()
		const converter = this.model.converters[ modelName ]
		if( converter === undefined ){
		
			console.warn( `Could not find a converter for that color model name (${ modelName }).`, this )
			return null
		}
		return converter( this )
	}
	toRGB (){ return this.to( 'RGB' )}
	toRGBA(){ return this.to( 'RGBA' )}
	toHSL (){ return this.to( 'HSL' )}
	toHSLA(){ return this.to( 'HSLA' )}
	toHSB (){ return this.to( 'HSB' )}
	toHSBA(){ return this.to( 'HSBA' )}
	toCMYK(){ return this.to( 'CMYK' )}
	as( presenterName ){

		if( isNotUsefulString( presenterName )){
		
			console.warn( `The “presenterName” argument was not a useful String (${ presenterName }).`, this )
			return null
		}
		const presenter = this.model.presenters[ presenterName ]
		if( presenter === undefined ){
			
			console.warn( `Could not find a presenter by that name (${ presenterName }).`, this )
			return null
		}
		return presenter( this )
	}
	log( label ){
		
		if( isNotUsefulString( label )) label = this.modelName +' '+ this.channels.join( ' ' )
		const max = Math.max( 12, label.length )
		label = label.padEnd( max, ' ' )
		const blank = ''.padEnd( max + 4, ' ' )


		//  This is only a quick gut-check,
		//  so is fine to pass through multiple converters
		//  rather than potentially “more native” converters.

		const 
		background = this.toHSLA(),//  We want  to be able to judge overall LIGHTNESS!
		foreground = background.l >= 50 || background.a < 50 ? 'black' : 'white'

		console.log( `%c${ blank }\n  ${ label }  \n${ blank }`, `background-color: ${ background.as( 'css' )}; color: ${ foreground };` )
		return this
	}
	distanceTo( other ){

		const 
		sibling = 
			this.modelName === other.modelName
			? other
			: other.to( this.modelName ),
		ranges = Object.values( this.model.channels ),
		distance = this.channels
		.reduce( function( sum, channel, i ){

			return sum + channelDelta( channel, sibling.channels[ i ], ranges[ i ])

		}, 0 )

		return distance
	}
	isEqualTo( other, epsilon ){

		if( isNotUsefulNumber( epsilon )) epsilon = 0.1
		const sibling = 
			this.modelName === other.modelName
			? other
			: other.to( this.modelName )
		if( isNotColor( sibling )){

			console.warn( `Could not compare this color`, this, `to another color`, other, `because a proper color model converter could not be located.`  )
			return null
		}
		
		const 
		ranges = Object.values( this.model.channels ),
		areEqual = this.channels
		.every( function( channel, i ){

			return channelDelta( channel, sibling.channels[ i ], ranges[ i ]) <= epsilon
		})
		
		return areEqual
	}
}
function isColor( c ){

	return c instanceof Color
}
function isNotColor( c ){

	return !isColor( c )
}






    /////////////////////
   //                 //
  //   Convenience   //
 //                 //
/////////////////////


//  Why not just make these extend Color?
//  Because we’re asking folks to import our named objects
//  into their scope with who-knows-what in it.
//  Importing `Color` isn’t so bad --
//  it’s just one single term and it’s 5 characters long.
//  But all of these?
//  These increase chances of name collisions,
//  and who wants to have to alias everything?
//  Nah... Let’s keep all the hard logic in Color.

function RGB(){  return new Color( 'RGB',  ...arguments )}
function RGBA(){ return new Color( 'RGBA', ...arguments )}
function HSL(){  return new Color( 'HSL',  ...arguments )}
function HSLA(){ return new Color( 'HSLA', ...arguments )}
function HSB(){  return new Color( 'HSB',  ...arguments )}
function HSBA(){ return new Color( 'HSBA', ...arguments )}
function CMYK(){ return new Color( 'CMYK', ...arguments )}






    //////////////////
   //              //
  //   Share :)   //
 //              //
//////////////////


export {

	VERSION,


	//  Converters.
		
	decToHex,
	hexToDec,

	rgbToHsl,
	hslToRgb,

	rgbToHsb,
	hsbToRgb,
	
	hsbToHsl,
	hslToHsb,
	
	rgbToCmyk,
	cmykToRgb,
	

	//  The goods.

	colorModels,
	Color,
	isColor,
	isNotColor,


	//  Super convenience functions.

	RGB,
	RGBA,
	HSL,
	HSLA,
	HSB,
	HSBA,
	CMYK,

	demo
}
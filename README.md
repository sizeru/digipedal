# Documentation For Our Prototype
## Our Resources On Hand
- a Rapsberry Pi 1B+. [Datasheet here](https://www.raspberrypi.com/documentation/computers/processors.html).
- a dream

## Resource Analysis
- **SoC Hardware**: RPi 1B+ contains an ARM BCM2835 SoC. This SoC contains many modules, such as the RAM, the CPU, the GPU, etc.
- **Peripherals**: We have USB input and output. We could use these for an ADC and a DAC in order to get sound in and out of the RPi (analog-to-digital converter & digital-to-analog converter).
- **CPU Clock Speed**: The BCM2835 documentation states that the CPU is clocked at 250MHz, with a nominal clock of 150MHz. Although the processor states iruns at 700MHz. I'm not sure what a nominal clock is, but I'll use the lowest number (150MHz) as our hard limit.
- **Audio Requirement**: CD audio is 16bit, 44.1kHz. The upper limit of human hearing is rougly ~20kHz. The Nyquist frequency for this would be 40kHz. So CDs give just a bit of headroom. The 16 bits are used for amplitude (aka loudness).
- **RAM**: The RPi has 500MB of RAM. More importantly it has 128KB L2 cache, 16KB L1 data cache, 16KB L1 instruction cache.

## Limit Analysis
- Assume we can only reliable use 1/3rd of the nominal CPU voltage (due to OS overhead, ssh servers, etc.) - so 50MHz.
- We have a budget of ~1000 CPU cycles per audio sample to run our effect. This is our required throughput. And should be more than enough.
- Having some latency is okay. Many effects will buffer previous samples and add them to the current sample. (For example, reverb, delay, etc).
- 16KB data cache & 2B amplitude means we can have (at minimum) an 8K sample buffer fully in L1 cache, and a 64K sample buffer fully in L2 cache. This translates to a 0.18s buffer in L1 or a 1.45s buffer in L2. Not sure what these cache hit latencies are yet for L1 & L2, as these may eat a significant chunk of our budget. Are larger buffer is often not necessary, except for effects like delay, which will replay audio over and over again.

## Limits In Short
- ~1000 cycle budget per input audio sample
- ~0.18s buffer in L1 cache
- ~1.45s buffer in L2 cache


## Pedals
Sorted by how distinct, interesting, and plausible they are. A handful of pedals (3-5) is our goal for this project.

### Reverb
- Easy implementation.
- Reverb extends the amount of time that a sound takes to decay, which makes a sound fuller.

### Delay
- Easy implentation, but may or may not be limited based on size of buffer
- Delay provides an echo effect to a sound, which can create complex textures out of simple tunes.
- [All about delay pedals](https://articles.boss.info/the-complete-guide-to-delay-pedals/), [Cool delay pedal](https://articles.boss.info/the-complete-guide-to-delay-pedals/)

### Chorus
- Medium implementation
- Chorus pedals emphasize the harmonics of a sound, so that a sound may be more vibrant, as if it is being played by several instruments at once. Typically also has a tremolo control as well.

### Compressor
- Medium implementation
- A compressor reduces the dynamic range of a sound coming in. This means that loud sounds are made quiter, and quiet sounds are made louder.

### Tremolo
- Easy implementation
- A tremolo pedal will rapidly pulse the volume to create a unique effect.

### Vibrato
- Easy implementation
- A vibrato pedal will wobble the pitch of a sound in order to create a unique effect.

### Tuner
- Medium implementation
- Tunes the sound of your guitar to the closest note.

### Octave
- Easy implementation
- An octave pedal repeats exactly what is played in a different octave, or in multiple different octaves.

### Loop
- ??. Probably hard implementation.
- Looping will record a short section of sound and allow you to play it back on a loop. The length of a loop typically ranges from a few seconds to under a minute.

### Distortion
- ?? implementation. Probably hard. 
- Several different effects. Compresses the dynamic range while providing a wider sound (aka. more prominent overtones). This isn't that accurate of a description.

### Fuzz 
- ??. Probably hard. 
- Like distortion, but with lots of unique effects, and typically more understated.


### Overdrive
- ??
- Like distortion, but louder, with intentional distortions when clipping.


### Wah
- Impossible. A wah pedal requires a literal foot pedal to control it. We do not have that control.
- Wah pedals allow you to dynamically change the sound on the fly.

### Flanger
- ??. Probably hard. No idea how this works.



### Rotary
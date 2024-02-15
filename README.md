# A Digital Guitar Pedal
This is a digital guitar pedal which can be controlled from a handheld device. Created by Nathan, Jay, Joshua, and Christian as our final project for HCI.

## Summary
A product that allows users to experiment with several different guitar pedals digitally.

## Project Goals
- **Realtime Audio I/O**: @ 16bit, 44.1kHz. This is what CDs use. It is above the Nyquist frequency for the limits of human hearing, and it provides sufficient dynamic range for volume.
- **Effect Choice**: Users should be able to switch their effect and settings for their effect in real time.
- **Stretch Goal: Pedalboard**: Users can string multiple effects into another. This may be difficult.

## Resources On Hand
- a Rapsberry Pi 1B+. [Datasheet here](https://www.raspberrypi.com/documentation/computers/processors.html).
- a dream

## Resource Details
- **SoC**: RPi 1B+ contains a BCM2835 SoC. This is an SoC from Broadcom that contains many modules, including: RAM, CPU, GPU, etc.
- **I/O**: The RPi 1B+ has 2 USB ports. This is the easiest way I can see to get sound in and out of the RPi. We would need to use an ADC & DAC (analog-to-digital converter & digital-to-analog converter).
- **CPU Clock Speed**: There is conflicting information in terms of clock rate. Raspberry Pi says that the B+ has a 700MHz clock. The BCM2835 documentation states that the CPU is clocked at 250MHz, and also that it has a nominal clock of 150MHz. I'm not sure what a nominal clock is, but we should use the lowest number provided to be safe. This means, for all intents and purposes, our CPU has a 150MHz clock.
- **RAM**: The RPi has 500MB of RAM, 128KB L2 cache, 16KB L1 data cache, 16KB L1 instruction cache.

## Performance Budget / Hardware Limitations
- **~1100 CPU cycles per audio sample**: Arbitrarily assumes we can only use about 1/3rd of the CPU clock (due to OS overhead, SSH overhead, WiFi overhead, etc.). 50MHz / 44.1kHz = 1133 cycles. This is our throughput. Latency is okay and expected, but our throughput must remain constant.
- **~0.13s buffer in L1 cache**: With 16 bit (2B) samples, and a 16KB data cache, we can store 8k samples in the L1 cache. Arbitrarily assuming 4KB overhead for shenanigains by other programs, this brings us down to 6k samples in L1 cache. 6k / 44.1kHz = 0.13s
- **~1.4s buffer in L2 cache**: Should all data exist in the L2 cache, w will be able to store 64k samples, translating to about 1.4s.

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
- ??. idek what this is.
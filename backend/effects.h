// This file contains all the effects. Every tick, we run will run one of these
// functions on our code. This will modify the sound signal (aka. the buffer) to
// create each effect.
#include "shorttypes.h"

#define BUFFER_ARGS s16* const buffer, const size_t bufferSize, const size_t idx

void reverb_digi(BUFFER_ARGS, u8 width);
void delay_digi(BUFFER_ARGS);
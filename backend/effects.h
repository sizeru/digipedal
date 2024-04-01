// This file contains all the effects. Every tick, we run will run one of these
// functions on our code. This will modify the sound signal (aka. the buffer) to
// create each effect.
#include "shorttypes.h"

typedef enum {
	REVERB_DIGI,
	DELAY_DIGI,
	DISTORT_DIGI
} PedalName;

typedef struct {
	PedalName name;
	void(*effect)();
} Pedal;

typedef struct BufferInfo {
	size_t length;
	int fd;
} BufferInfo;

#define BUFFER_ARGS s16* const buffer, const BufferInfo* bufferInfo, const size_t idx

void reverb_digi(BUFFER_ARGS, u8 width);
void delay_digi(BUFFER_ARGS, u16 time, u8 strength);
void distort_digi(BUFFER_ARGS, f32 strength);

// Mapping of all pedals to functions. TODO: Currently, this order must be in
// the same order as the enum, which I do not enjoy. A large hash table may be a
// better idea for this.
static Pedal PEDALS[] = {
	{REVERB_DIGI, (void(*)()) reverb_digi},
	{DELAY_DIGI, (void(*)()) delay_digi},
	{DISTORT_DIGI, (void(*)()) distort_digi}
};
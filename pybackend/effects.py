from enum import Enum
import numpy as np

class PedalName(Enum):
    REVERB_DIGI = 0
    DELAY_DIGI = 1
    DISTORT_DIGI = 2
    DEFAULT_PED = -1
    
class Pedal:
    pname = PedalName.DEFAULT_PED
    effect = None
    def __init__(self, pedal_enum, effect_func) -> None:
        self.pname = pedal_enum
        self.effect = effect_func
        
class BufferInfo:
    length = 0
    fd = 0
    def __init__(self, length, fd) -> None:
        self.length = length
        self.fd = fd
        
# def reverb_digi(buffer, idx, width):
#     MAX_WIDTH = np.iinfo(np.int16).max
#     MIN_WIDTH = np.iinfo(np.int16).max
#     buffer[idx] += ((buffer[idx-1] * width) >> 8)

def delay_digi(buffer, idx, width):
    MAX_WIDTH = np.iinfo(np.int16).max
    MIN_WIDTH = np.iinfo(np.int16).max
    buffer[idx] += ((buffer[idx-1] * width) >> 8)
    
# def distort_digi(buffer, idx, width):
#     MAX_WIDTH = np.iinfo(np.int16).max
#     MIN_WIDTH = np.int16(np.iinfo(np.int16).min)
#     buffer[idx] = np.clip(buffer[idx], MIN_WIDTH, MAX_WIDTH
    
PEDALS = [Pedal(PedalName.REVERB_DIGI, None),
          Pedal(PedalName.DELAY_DIGI, delay_digi),
          Pedal(PedalName.DISTORT_DIGI, None)]

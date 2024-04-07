SRC = myAmp.c
OUT = myAmp.so
.PRAGMA = clean

${OUT}: ${SRC}
	gcc -fvisibility=hidden -fPIC -Wl,-Bstatic -Wl,-Bdynamic -Wl,--as-needed -shared -pthread `pkg-config --cflags lv2` -lm `pkg-config --libs lv2` ${SRC} -o ${OUT}

clean:
	rm -f ${OUT}

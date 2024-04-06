# On Pedals
## Building
This command can be used to build a pedal:
```
gcc -fvisibility=hidden -fPIC -Wl,-Bstatic -Wl,-Bdynamic -Wl,--as-needed -shared -pthread `pkg-config --cflags lv2` -lm `pkg-config --libs lv2` foo.c -o foo.so
```
I installed jack-example-tools. This is a major help. After starting the server.

1. Start each pedal using `jalv -n 'name' uri`.
2. List processes using `jack_lsp`.
4. Start audio using `mpv --ao==jack file.wav`.
3. Connect inputs and outputs using `jack_connect port1 port2`.

## Installing a Pedal
We must copy files into the pedal search directory every time. This is typically `/usr/lib/lv2/`

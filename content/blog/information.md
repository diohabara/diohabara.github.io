---
title: "picoCTF 2021: Information"
date: 2023-07-07T00:27:57-05:00
draft: false
type: "post"
tags: ["CTF", "Forensics"]
---

- [Solution](#solution)
- [Acknowledgement](#acknowledgement)

## Solution

First, let's check the file type.

```sh
$ file resources/cat.jpg 
resources/cat.jpg: JPEG image data, JFIF standard 1.02, aspect ratio, density 1x1, segment length 16, baseline, precision 8, 2560x1598, components 3
```

Then, let's check the metadata.

```sh
$ exiftool resources/cat.jpg 
ExifTool Version Number         : 12.55
File Name                       : cat.jpg
Directory                       : resources
File Size                       : 878 kB
File Modification Date/Time     : 2023:07:06 23:51:14-05:00
File Access Date/Time           : 2023:07:06 23:56:06-05:00
File Inode Change Date/Time     : 2023:07:06 23:51:14-05:00
File Permissions                : -rw-r--r--
File Type                       : JPEG
File Type Extension             : jpg
MIME Type                       : image/jpeg
JFIF Version                    : 1.02
Resolution Unit                 : None
X Resolution                    : 1
Y Resolution                    : 1
Current IPTC Digest             : 7a78f3d9cfb1ce42ab5a3aa30573d617
Copyright Notice                : PicoCTF
Application Record Version      : 4
XMP Toolkit                     : Image::ExifTool 10.80
License                         : cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9
Rights                          : PicoCTF
Image Width                     : 2560
Image Height                    : 1598
Encoding Process                : Baseline DCT, Huffman coding
Bits Per Sample                 : 8
Color Components                : 3
Y Cb Cr Sub Sampling            : YCbCr4:2:0 (2 2)
Image Size                      : 2560x1598
Megapixels                      : 4.1
```

The `License` field looks like base64. Let's decode it.

```sh
$ echo "cGljb0NURnt0aGVfbTN0YWRhdGFfMXNfbW9kaWZpZWR9" | base64 -d
picoCTF{the_m3tadata_1s_modified}
```

## Acknowledgement

Thank you, CMU security and privacy experts, for creating this challenge.

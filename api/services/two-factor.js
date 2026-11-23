"use strict";

/* ==========================================================
   IMPORTS
========================================================== */

const crypto = require("node:crypto");

/* ==========================================================
   CONFIGURATION
========================================================== */

const TOTP_PERIOD = 30;
const TOTP_DIGITS = 6;
const TOTP_ALGORITHM = "sha1";

/* ==========================================================
   CLÉ DE CHIFFREMENT
========================================================== */

function getEncryptionKey()
{
    const keyHex =
        process.env.TOTP_ENCRYPTION_KEY;

    if (
        !keyHex ||
        !/^[a-f0-9]{64}$/i.test(keyHex)
    )
    {
        throw new Error(
            "TOTP_ENCRYPTION_KEY doit contenir 64 caractères hexadécimaux."
        );
    }

    return Buffer.from(keyHex, "hex");
}

/* ==========================================================
   CHIFFREMENT AES-256-GCM
========================================================== */

function encryptSecret(secret)
{
    const iv = crypto.randomBytes(12);

    const cipher = crypto.createCipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        iv
    );

    const encrypted = Buffer.concat([
        cipher.update(secret, "utf8"),
        cipher.final()
    ]);

    const authTag = cipher.getAuthTag();

    return [
        iv.toString("hex"),
        authTag.toString("hex"),
        encrypted.toString("hex")
    ].join(":");
}

/* ==========================================================
   DÉCHIFFREMENT AES-256-GCM
========================================================== */

function decryptSecret(encryptedSecret)
{
    const parts = encryptedSecret.split(":");

    if (parts.length !== 3)
    {
        throw new Error(
            "Format du secret chiffré invalide."
        );
    }

    const [ivHex, tagHex, dataHex] = parts;

    const decipher = crypto.createDecipheriv(
        "aes-256-gcm",
        getEncryptionKey(),
        Buffer.from(ivHex, "hex")
    );

    decipher.setAuthTag(
        Buffer.from(tagHex, "hex")
    );

    const decrypted = Buffer.concat([
        decipher.update(
            Buffer.from(dataHex, "hex")
        ),
        decipher.final()
    ]);

    return decrypted.toString("utf8");
}

/* ==========================================================
   ENCODAGE BASE32
========================================================== */

function encodeBase32(buffer)
{
    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    let bits = 0;
    let value = 0;
    let result = "";

    for (const byte of buffer)
    {
        value = (value << 8) | byte;
        bits += 8;

        while (bits >= 5)
        {
            result += alphabet[
                (value >>> (bits - 5)) & 31
            ];

            bits -= 5;
        }
    }

    if (bits > 0)
    {
        result += alphabet[
            (value << (5 - bits)) & 31
        ];
    }

    return result;
}

function decodeBase32(secret)
{
    const alphabet =
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";

    const normalized = secret
        .toUpperCase()
        .replace(/[\s=-]/g, "");

    let bits = 0;
    let value = 0;
    const bytes = [];

    for (const character of normalized)
    {
        const index = alphabet.indexOf(character);

        if (index === -1)
        {
            throw new Error(
                "Secret Base32 invalide."
            );
        }

        value = (value << 5) | index;
        bits += 5;

        if (bits >= 8)
        {
            bytes.push(
                (value >>> (bits - 8)) & 255
            );

            bits -= 8;
        }
    }

    return Buffer.from(bytes);
}

/* ==========================================================
   GÉNÉRATION DU SECRET AUTHENTICATOR
========================================================== */

function generateTotpSecret()
{
    return encodeBase32(
        crypto.randomBytes(20)
    );
}

/* ==========================================================
   CALCUL DU CODE TOTP
========================================================== */

function calculateTotp(secret, counter)
{
    const key = decodeBase32(secret);

    const counterBuffer = Buffer.alloc(8);

    counterBuffer.writeBigUInt64BE(
        BigInt(counter)
    );

    const hmac = crypto
        .createHmac(TOTP_ALGORITHM, key)
        .update(counterBuffer)
        .digest();

    const offset =
        hmac[hmac.length - 1] & 15;

    const binary =
        (hmac.readUInt32BE(offset) & 0x7fffffff);

    return String(
        binary % (10 ** TOTP_DIGITS)
    ).padStart(TOTP_DIGITS, "0");
}

/* ==========================================================
   VÉRIFICATION DU CODE AUTHENTICATOR
========================================================== */

function verifyTotp(secret, code)
{
    const normalizedCode = String(code);

    if (!/^\d{6}$/.test(normalizedCode))
    {
        return false;
    }

    const counter = Math.floor(
        Date.now() / 1000 / TOTP_PERIOD
    );

    // Tolérance de 30 secondes dans chaque sens.

    for (let offset = -1; offset <= 1; offset++)
    {
        const expected = calculateTotp(
            secret,
            counter + offset
        );

        if (
            crypto.timingSafeEqual(
                Buffer.from(normalizedCode),
                Buffer.from(expected)
            )
        )
        {
            return true;
        }
    }

    return false;
}

/* ==========================================================
   GÉNÉRATION DU CODE E-MAIL
========================================================== */

function generateEmailCode()
{
    return String(
        crypto.randomInt(0, 1000000)
    ).padStart(6, "0");
}

/* ==========================================================
   HASH SHA-256
========================================================== */

function hashCode(code)
{
    return crypto
        .createHash("sha256")
        .update(String(code))
        .digest("hex");
}

/* ==========================================================
   EXPORTS
========================================================== */

module.exports = {
    encryptSecret,
    decryptSecret,
    generateTotpSecret,
    verifyTotp,
    generateEmailCode,
    hashCode
};
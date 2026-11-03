
"use strict";

/* ==========================================================
   IBM OLD COMPUTER — MODEL BOOMER
   DÉMARRAGE RÉTRO ET EFFETS SONORES
========================================================== */

const adminBootScreen =
    document.getElementById("admin-boot-screen");

const adminBootOutput =
    document.getElementById("admin-boot-output");

/* ==========================================================
   FICHIERS AUDIO
========================================================== */

const adminBootSound =
    new Audio("assets/sounds/IBM.mp3");

const adminFanSound =
    new Audio("assets/sounds/fanpc2.mp3");

const adminDiskSound =
    new Audio("assets/sounds/readerdisk2.mp3");

adminBootSound.preload = "auto";
adminFanSound.preload = "auto";
adminDiskSound.preload = "auto";

adminBootSound.volume = 0.8;
adminFanSound.volume = 0.12;
adminDiskSound.volume = 0.45;

adminFanSound.loop = true;

/* ==========================================================
   ÉTAT DU DÉMARRAGE
========================================================== */

let adminBootRunning = false;
let adminBootFinished = null;
let adminBootSession = 0;
let adminBootTimers = new Set();

let adminFanFadeTimer = null;

const ADMIN_BOOT_MAX_DURATION = 45000;

/* ==========================================================
   TEMPORISATION ANNULABLE
========================================================== */

function adminBootWait(milliseconds)
{
    return new Promise((resolve) =>
    {
        const entry = {
            timer: null,
            resolve
        };

        entry.timer = setTimeout(() =>
        {
            adminBootTimers.delete(entry);
            resolve();
        }, milliseconds);

        adminBootTimers.add(entry);
    });
}

/* ==========================================================
   AFFICHAGE TERMINAL
========================================================== */

function adminBootPrint(message = "")
{
    if (!adminBootRunning)
    {
        return;
    }

    adminBootOutput.textContent += message + "\n";

    adminBootOutput.scrollTop =
        adminBootOutput.scrollHeight;
}

function adminBootReplaceLast(message)
{
    if (!adminBootRunning)
    {
        return;
    }

    const lines =
        adminBootOutput.textContent.split("\n");

    if (lines[lines.length - 1] === "")
    {
        lines.pop();
    }

    lines[lines.length - 1] = message;

    adminBootOutput.textContent =
        lines.join("\n") + "\n";

    adminBootOutput.scrollTop =
        adminBootOutput.scrollHeight;
}

/* ==========================================================
   ACTIVATION DES EFFETS SONORES
========================================================== */

function adminSoundEnabled()
{
    return localStorage.getItem(
        "admin-sound-enabled"
    ) !== "false";
}

function setAdminSoundEnabled(enabled)
{
    localStorage.setItem(
        "admin-sound-enabled",
        String(Boolean(enabled))
    );

    if (!enabled)
    {
        adminBootSound.pause();
        adminDiskSound.pause();
        stopAdminFan();
    }
    else if (
        !adminBootRunning &&
        document.getElementById("admin-screen")?.hidden === false
    )
    {
        startAdminFan();
    }
}

/* ==========================================================
   LECTURE AUDIO SÉCURISÉE
========================================================== */

function adminPlaySound(audio, restart = true)
{
    if (!adminSoundEnabled())
    {
        return;
    }

    if (restart)
    {
        audio.pause();
        audio.currentTime = 0;
    }

    audio.play().catch((error) =>
    {
        console.warn(
            "Lecture audio indisponible :",
            error
        );
    });
}

/* ==========================================================
   VENTILATEUR PERMANENT
========================================================== */

function startAdminFan()
{
    if (!adminSoundEnabled())
    {
        return;
    }

    if (adminFanFadeTimer !== null)
    {
        clearInterval(adminFanFadeTimer);
        adminFanFadeTimer = null;
    }

    adminFanSound.volume = 0.12;

    adminPlaySound(adminFanSound, false);
}

/* ==========================================================
   ARRÊT PROGRESSIF DU VENTILATEUR
========================================================== */

function stopAdminFan()
{
    if (adminFanFadeTimer !== null)
    {
        clearInterval(adminFanFadeTimer);
        adminFanFadeTimer = null;
    }

    if (adminFanSound.paused)
    {
        adminFanSound.currentTime = 0;
        return;
    }

    let volume = adminFanSound.volume;

    adminFanFadeTimer = setInterval(() =>
    {
        volume = Math.max(0, volume - 0.01);

        adminFanSound.volume = volume;

        if (volume <= 0)
        {
            clearInterval(adminFanFadeTimer);
            adminFanFadeTimer = null;

            adminFanSound.pause();
            adminFanSound.currentTime = 0;
            adminFanSound.volume = 0.12;
        }
    }, 80);
}

/* ==========================================================
   LECTEUR DE DISQUETTES
========================================================== */

function adminBootFloppy()
{
    adminPlaySound(adminDiskSound);
}

/* ==========================================================
   BIP DE VALIDATION ASCII BEL
========================================================== */

function adminBootBeep()
{
    if (!adminSoundEnabled())
    {
        return;
    }

    const AudioContextClass =
        window.AudioContext ||
        window.webkitAudioContext;

    if (!AudioContextClass)
    {
        return;
    }

    const context = new AudioContextClass();

    const oscillator = context.createOscillator();
    const gain = context.createGain();

    oscillator.type = "square";
    oscillator.frequency.value = 800;

    gain.gain.setValueAtTime(
        0.035,
        context.currentTime
    );

    gain.gain.exponentialRampToValueAtTime(
        0.0001,
        context.currentTime + 0.15
    );

    oscillator.connect(gain);
    gain.connect(context.destination);

    oscillator.start();
    oscillator.stop(context.currentTime + 0.15);

    oscillator.onended = () =>
    {
        context.close().catch(() => {});
    };
}

/* ==========================================================
   FIN DU DÉMARRAGE
========================================================== */

function finishAdminBoot()
{
    if (!adminBootRunning)
    {
        return;
    }

    adminBootRunning = false;

    for (const entry of adminBootTimers)
    {
        clearTimeout(entry.timer);
        entry.resolve();
    }

    adminBootTimers.clear();

    document.removeEventListener(
        "keydown",
        adminBootKeydown
    );

    adminBootSound.pause();
    adminBootSound.currentTime = 0;

    adminDiskSound.pause();
    adminDiskSound.currentTime = 0;

    adminBootScreen.hidden = true;

    startAdminFan();

    if (adminBootFinished)
    {
        const resolve = adminBootFinished;
        adminBootFinished = null;
        resolve();
    }
}

/* ==========================================================
   TOUCHE ÉCHAP
========================================================== */

function adminBootKeydown(event)
{
    if (event.key === "Escape")
    {
        event.preventDefault();
        finishAdminBoot();
    }
}

/* ==========================================================
   COMPTAGE MÉMOIRE
========================================================== */

async function adminBootMemoryTest(session)
{
    adminBootPrint("MEMORY TEST: 000 TB");

    for (let memory = 16; memory <= 640; memory += 16)
    {
        await adminBootWait(100);

        if (
            !adminBootRunning ||
            session !== adminBootSession
        )
        {
            return false;
        }

        adminBootReplaceLast(
            "MEMORY TEST: " +
            String(memory).padStart(3, "0") +
            " TB OK"
        );
    }

    return true;
}

/* ==========================================================
   SÉQUENCE PRINCIPALE
========================================================== */

async function runAdminBootSequence(session)
{
    const active = () =>
        adminBootRunning &&
        session === adminBootSession;

    adminBootPrint("IBM OLD COMPUTER");
    adminBootPrint("MODEL BOOMER");
    adminBootPrint("(C) COPYRIGHT IBM CORP. 2026");
    adminBootPrint("");

    await adminBootWait(3000);
    if (!active()) return;

    adminBootPrint("POWER ON SELF TEST");
    adminBootPrint("");

    await adminBootWait(2000);
    if (!active()) return;

    adminBootPrint("INTEL-AMD CPU .............. OK");
    adminBootPrint("SYSTEM ROM ............ OK");
    adminBootPrint("KEYBOARD .............. OK");
    adminBootPrint("");

    await adminBootWait(1500);
    if (!active()) return;

    if (!(await adminBootMemoryTest(session)))
    {
        return;
    }

    await adminBootWait(1500);
    if (!active()) return;

    adminBootPrint("");
    adminBootPrint("TOTAL BASE MEMORY");
    adminBootPrint("SYSTEM CONFIGURATION .. OK");
    adminBootPrint("");

    await adminBootWait(2000);
    if (!active()) return;

    adminBootPrint("Terminal DRIVE API: Infinite");
    adminBootPrint("SEEKING BOOT SECTOR...");

    await adminBootWait(3500);
    if (!active()) return;

    adminBootPrint("BOOT SECTOR ........... OK");
    adminBootPrint("");

    await adminBootWait(1500);
    if (!active()) return;

    adminBootPrint("IBM Quantum COMPUTER");
    adminBootPrint("VERSION 2026");
    adminBootPrint("");

    await adminBootWait(2000);
    if (!active()) return;

    adminBootPrint("A>DIR");
    adminBootPrint("");
    adminBootPrint("COMMAND  COM");
    adminBootPrint("CONFIG   SYS");
    adminBootPrint("ADMIN    EXE");
    adminBootPrint("");

    await adminBootWait(2000);
    if (!active()) return;

    adminBootPrint("A>ADMIN.EXE");
    adminBootPrint("");

    await adminBootWait(1500);
    if (!active()) return;

    adminBootPrint("INITIALIZING ADMINISTRATION...");
    adminBootPrint("LOADING USER INTERFACE...");

    await adminBootWait(2000);
    if (!active()) return;

    adminBootPrint("");
    adminBootPrint("SYSTEM READY.");
}

/* ==========================================================
   LANCEMENT DEPUIS LOGIN.JS
========================================================== */

function startAdminBoot()
{
    if (adminBootRunning)
    {
        return Promise.resolve();
    }

    if (!adminBootScreen || !adminBootOutput)
    {
        return Promise.resolve();
    }

    adminBootSession++;
    adminBootRunning = true;

    adminBootOutput.textContent = "";
    adminBootScreen.hidden = false;

    document.addEventListener(
        "keydown",
        adminBootKeydown
    );

    const completion = new Promise((resolve) =>
    {
        adminBootFinished = resolve;
    });

    /* Son réel du démarrage */

    adminBootSound.currentTime = 0;

    if (adminSoundEnabled())
    {
        adminPlaySound(adminBootSound);
    }

    /* Fin à la fin de l'enregistrement */

    adminBootSound.onended = () =>
    {
        finishAdminBoot();
    };

    /* Sécurité si le son ne démarre pas */

    const session = adminBootSession;

    (async () =>
    {
        await runAdminBootSequence(session);

        if (
            adminBootRunning &&
            session === adminBootSession
        )
        {
            await adminBootWait(
                Math.max(
                    0,
                    ADMIN_BOOT_MAX_DURATION -
                    34000
                )
            );

            if (
                adminBootRunning &&
                session === adminBootSession
            )
            {
                finishAdminBoot();
            }
        }
    })().catch((error) =>
    {
        console.error(error);
        finishAdminBoot();
    });

    return completion;
}

/* ==========================================================
   DÉCONNEXION ADMINISTRATEUR
========================================================== */

function stopAdminBootSessionAudio()
{
    if (adminBootRunning)
    {
        finishAdminBoot();
    }

    adminBootSound.pause();
    adminBootSound.currentTime = 0;

    adminDiskSound.pause();
    adminDiskSound.currentTime = 0;

    stopAdminFan();
}

Set WshShell = CreateObject("WScript.Shell")

ruta = WScript.Arguments(0)

WshShell.Run "cmd.exe /k cd /d """ & ruta & """ && npm run dev", 0, False
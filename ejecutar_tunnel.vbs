Set WshShell = CreateObject("WScript.Shell")
comando = WScript.Arguments(0)
WshShell.Run "cmd /c " & comando, 0, False

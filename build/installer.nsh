; Custom NSIS script to add auto-start option with checkbox

!include "MUI2.nsh"

; Custom page for auto-start option
Var AutoStartCheckbox
Var AutoStartCheckboxState

; Custom page
Page custom AutoStartPage AutoStartPageLeave

Function AutoStartPage
  !insertmacro MUI_HEADER_TEXT "Installation Options" "Configure startup behavior"
  
  nsDialogs::Create 1018
  Pop $0
  
  ${NSD_CreateCheckbox} 0 0 100% 12u "Launch BeeperLite at Windows startup"
  Pop $AutoStartCheckbox
  ${NSD_SetState} $AutoStartCheckbox ${BST_CHECKED}
  
  nsDialogs::Show
FunctionEnd

Function AutoStartPageLeave
  ${NSD_GetState} $AutoStartCheckbox $AutoStartCheckboxState
FunctionEnd

!macro customInstall
  ; Kill any running instances before installation
  nsExec::ExecToLog 'taskkill /F /IM BeeperLite.exe'
  
  ; Check if auto-start checkbox was checked
  ${If} $AutoStartCheckboxState == ${BST_CHECKED}
    ; Create registry key for auto-start
    WriteRegStr HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "BeeperLite" "$INSTDIR\BeeperLite.exe"
  ${Else}
    ; Remove registry key if exists
    DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "BeeperLite"
  ${EndIf}
!macroend

!macro customUnInstall
  ; Kill any running instances before uninstallation
  nsExec::ExecToLog 'taskkill /F /IM BeeperLite.exe'
  
  ; Remove auto-start registry key on uninstall
  DeleteRegValue HKCU "Software\Microsoft\Windows\CurrentVersion\Run" "BeeperLite"
!macroend

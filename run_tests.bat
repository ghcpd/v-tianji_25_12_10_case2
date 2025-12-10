@echo off
echo Running flaky bug detection - 5 rounds
echo.

set FAIL_COUNT=0

for /L %%i in (1,1,5) do (
    echo Round %%i:
    npm test -- --run > temp_output.txt 2>&1
    if errorlevel 1 (
        echo   FAILED
        set /a FAIL_COUNT+=1
        type temp_output.txt
    ) else (
        echo   PASSED
    )
    echo.
    timeout /t 1 /nobreak > nul
)

echo Summary: %FAIL_COUNT% out of 5 rounds failed
del temp_output.txt
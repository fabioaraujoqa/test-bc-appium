#!/bin/bash
# Roda a suíte nos aparelhos dos perfis em DEVICES (padrão: emulador celular simulador),
# EM PARALELO, cada um com seu próprio processo Appium (porta do .env.bc.<perfil>).
# Um único Appium compartilhado por dois aparelhos derruba a instrumentação do
# UiAutomator2 de um deles no meio da execução (ver docs/systems/operacao-bc.md).
#
# Uso:
#   scripts/test-bc-parallel.sh                         # suíte completa, em paralelo
#   scripts/test-bc-parallel.sh --sequencial            # um aparelho por vez
#   scripts/test-bc-parallel.sh --spec tests/specs/bc/smoke.spec.js
#   DEVICES="emulador celular" scripts/test-bc-parallel.sh
#   BC_AVD=Medium_Phone scripts/test-bc-parallel.sh     # outro AVD para o emulador
set -u

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

DEVICES="${DEVICES:-emulador celular simulador}"
AVD_EMULADOR="${BC_AVD:-$(sed -n 's/^ANDROID_AVD=//p' .env.bc 2>/dev/null)}"
AVD_EMULADOR="${AVD_EMULADOR:-Pixel_5}"
DIR_LOGS="$RAIZ/test-results/logs"

SEQUENCIAL=0
ARGS=()
for arg in "$@"; do
  if [ "$arg" = "--sequencial" ]; then SEQUENCIAL=1; else ARGS+=("$arg"); fi
done

titulo() {
  echo ""
  echo "═══════════════════════════════════════════════════════"
  echo "$1"
  echo "═══════════════════════════════════════════════════════"
}

titulo "1) Conferindo os aparelhos: ${DEVICES}"
for perfil in $DEVICES; do
  case "$perfil" in
    celular|tablet)
      UDID="$(sed -n 's/^ANDROID_UDID=//p' ".env.bc.${perfil}" 2>/dev/null)"
      if [ -z "$UDID" ] || ! adb devices | grep -q "^${UDID}[[:space:]]\+device$"; then
        echo "❌ ${perfil} (UDID '${UDID:-<vazio>}') não está em 'adb devices' como 'device'."
        echo "   Conecte o cabo USB e autorize a depuração, ou tire '${perfil}' de DEVICES."
        exit 1
      fi
      # Tela apagada/bloqueada faz o app não abrir a tempo (ver operacao-bc.md, "Aparelho físico")
      adb -s "$UDID" shell input keyevent KEYCODE_WAKEUP
      adb -s "$UDID" shell wm dismiss-keyguard 2>/dev/null
      echo "✅ ${perfil} conectado e acordado: ${UDID}"
      ;;
    emulador)
      if ! adb devices | grep -q "^emulator-[0-9]\+[[:space:]]\+device$"; then
        echo "Nenhum emulador rodando: subindo ${AVD_EMULADOR}..."
        nohup "$ANDROID_HOME/emulator/emulator" -avd "$AVD_EMULADOR" -no-boot-anim > /tmp/bc-emulador-boot.log 2>&1 &
        for _ in $(seq 1 180); do
          if [ "$(adb -e shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then break; fi
          sleep 1
        done
      fi
      SERIAL="$(adb devices | grep '^emulator-[0-9]\+[[:space:]]\+device$' | head -1 | awk '{print $1}')"
      if [ -z "$SERIAL" ]; then
        echo "❌ Emulador não ficou pronto a tempo. Veja /tmp/bc-emulador-boot.log."
        exit 1
      fi
      echo "✅ emulador pronto: ${SERIAL}"
      ;;
    simulador)
      NOME="$(sed -n 's/^IOS_DEVICE_NAME=//p' .env.bc.simulador 2>/dev/null)"
      if ! xcrun simctl list devices available 2>/dev/null | grep -q "${NOME:-<vazio>} ("; then
        echo "❌ Simulador '${NOME:-<vazio>}' não existe. Veja: xcrun simctl list devices available"
        exit 1
      fi
      echo "✅ simulador disponível: ${NOME} (o Appium liga se estiver desligado)"
      ;;
    *)
      echo "❌ Perfil desconhecido em DEVICES: ${perfil}"
      exit 1
      ;;
  esac
done

titulo "2) Rodando ($([ $SEQUENCIAL = 1 ] && echo sequencial || echo paralelo))"
npm run allure:reset > /dev/null
mkdir -p "$DIR_LOGS"

STATUS=0
PIDS=()
PERFIS_PIDS=()
for perfil in $DEVICES; do
  LOG="$DIR_LOGS/${perfil}.log"
  echo "▶ ${perfil}  (log: ${LOG})"
  if [ $SEQUENCIAL = 1 ]; then
    DEVICE_PROFILE="$perfil" npx wdio run tests/config/wdio.bc.conf.js ${ARGS[@]+"${ARGS[@]}"} > "$LOG" 2>&1
    if [ $? -ne 0 ]; then STATUS=1; echo "❌ ${perfil}"; else echo "✅ ${perfil}"; fi
    grep -E "PASSED in|FAILED in|Spec Files" "$LOG" || tail -n 20 "$LOG"
  else
    DEVICE_PROFILE="$perfil" npx wdio run tests/config/wdio.bc.conf.js ${ARGS[@]+"${ARGS[@]}"} > "$LOG" 2>&1 &
    PIDS+=($!)
    PERFIS_PIDS+=("$perfil")
  fi
done

for i in "${!PIDS[@]}"; do
  if wait "${PIDS[$i]}"; then
    echo "✅ ${PERFIS_PIDS[$i]}"
  else
    echo "❌ ${PERFIS_PIDS[$i]}"
    STATUS=1
  fi
done

if [ $SEQUENCIAL = 0 ]; then
  for perfil in $DEVICES; do
    echo ""
    echo "── ${perfil} ──"
    grep -E "PASSED in|FAILED in|Spec Files" "$DIR_LOGS/${perfil}.log" || tail -n 20 "$DIR_LOGS/${perfil}.log"
  done
fi

titulo "3) Gerando relatório Allure combinado"
npm run report:bc:generate > /dev/null && echo "✅ allure-report/ (abra com: npm run report:bc:open)"

exit $STATUS

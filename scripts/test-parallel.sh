#!/bin/bash
# Roda a suíte nos aparelhos dos perfis em DEVICES (padrão: emulador celular simulador),
# EM PARALELO, cada um com seu próprio processo Appium (portas em config/env.loader.js).
# Um único Appium compartilhado por dois aparelhos derruba a instrumentação do
# UiAutomator2 de um deles no meio da execução (ver docs/systems/operacao-banco-carrefour.md).
#
# Uso:
#   scripts/test-parallel.sh                             # suíte completa, em paralelo
#   scripts/test-parallel.sh --sequencial            # um aparelho por vez
#   scripts/test-parallel.sh --spec tests/specs/smoke.spec.js
#   DEVICES="emulador celular" scripts/test-parallel.sh
#   AVD=Medium_Phone scripts/test-parallel.sh     # outro AVD para o emulador
set -u

RAIZ="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$RAIZ"

# Lê um valor já resolvido pelo loader (padrões do código + .env) para um perfil
valor_do_perfil() {
  DEVICE_PROFILE="$1" node -e "
    try { console.log(require('./config/env.loader').carregarEnvDoPerfil()['$2'] || '') }
    catch (erro) { console.error(erro.message); process.exit(1) }"
}

DEVICES="${DEVICES:-emulador celular simulador}"
AVD_EMULADOR="${AVD:-$(valor_do_perfil emulador ANDROID_AVD)}"
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
      UDID="$(valor_do_perfil "$perfil" ANDROID_UDID)" || exit 1
      if ! adb devices | grep -q "^${UDID}[[:space:]]\+device$"; then
        echo "❌ ${perfil} (UDID '${UDID:-<vazio>}') não está em 'adb devices' como 'device'."
        echo "   Conecte o cabo USB e autorize a depuração, ou tire '${perfil}' de DEVICES."
        exit 1
      fi
      # Tela apagada/bloqueada faz o app não abrir a tempo (ver docs/systems/operacao-banco-carrefour.md, "Aparelho físico")
      adb -s "$UDID" shell input keyevent KEYCODE_WAKEUP
      adb -s "$UDID" shell wm dismiss-keyguard 2>/dev/null
      echo "✅ ${perfil} conectado e acordado: ${UDID}"
      ;;
    emulador)
      if ! adb devices | grep -q "^emulator-[0-9]\+[[:space:]]\+device$"; then
        echo "Nenhum emulador rodando: subindo ${AVD_EMULADOR}..."
        nohup "$ANDROID_HOME/emulator/emulator" -avd "$AVD_EMULADOR" -no-boot-anim > /tmp/emulador-boot.log 2>&1 &
        for _ in $(seq 1 180); do
          if [ "$(adb -e shell getprop sys.boot_completed 2>/dev/null | tr -d '\r')" = "1" ]; then break; fi
          sleep 1
        done
      fi
      SERIAL="$(adb devices | grep '^emulator-[0-9]\+[[:space:]]\+device$' | head -1 | awk '{print $1}')"
      if [ -z "$SERIAL" ]; then
        echo "❌ Emulador não ficou pronto a tempo. Veja /tmp/emulador-boot.log."
        exit 1
      fi
      echo "✅ emulador pronto: ${SERIAL}"
      ;;
    simulador)
      NOME="$(valor_do_perfil simulador IOS_DEVICE_NAME)" || exit 1
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
    DEVICE_PROFILE="$perfil" npx wdio run config/wdio.conf.js ${ARGS[@]+"${ARGS[@]}"} > "$LOG" 2>&1
    if [ $? -ne 0 ]; then STATUS=1; echo "❌ ${perfil}"; else echo "✅ ${perfil}"; fi
    grep -E "PASSED in|FAILED in|Spec Files" "$LOG" || tail -n 20 "$LOG"
  else
    DEVICE_PROFILE="$perfil" npx wdio run config/wdio.conf.js ${ARGS[@]+"${ARGS[@]}"} > "$LOG" 2>&1 &
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
npm run report:generate > /dev/null && echo "✅ allure-report/ (abra com: npm run report)"

exit $STATUS

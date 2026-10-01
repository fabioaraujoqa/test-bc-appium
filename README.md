Tutorial Appium para automação de testes em dispositivos Android

Intalar nodejs:
https://nodejs.org/en/download/

Instalar jdk:
https://www.oracle.com/java/technologies/javase-jdk11-downloads.html
https://www.oracle.com/java/technologies/javase-jdk11-downloads.html#license-light


Instalar Appium:
https://appium.io/docs/en/2.2/quickstart/install/
npm i --location=global appium

verificar se o appium está instalado:
appium -v
Executar o appium:
appium

---- 

Veriificar driver do appium:
appium driver list

Instalar driver do appium:
appium driver install uiautomator2

----- 

Instlar appium inspector:
https://github.com/appium/appium-inspector
https://github.com/appium/appium-inspector/releases

Abrir o appium inspector:
busque pelo appium inspector no menu iniciar do windows ou mac


-----

Intalar o appium-doctor:
npm install -g appium-doctor

verificar se o ambiente está configurado corretamente:
appium-doctor

--- 


Instalar Android Studio:
https://developer.android.com/studio

Adicionar o caminho do Android SDK às variáveis de ambiente:
No Windows:
1. Abra o Android Studio.
2. Vá para "File" > "Settings" > "Appearance & Behavior" > "System Settings" > "Android SDK".
3. Anote o caminho do Android SDK (geralmente algo como `C:\Users\SeuUsuario\AppData\Local\Android\Sdk`).       

No macOS ou Linux:
1. Abra o Android Studio.       
2. Vá para "Android Studio" > "Preferences" > "Appearance & Behavior" > "System Settings" > "Android SDK".
3. Anote o caminho do Android SDK (geralmente algo como `/Users/SeuUsuario/Library/Android/sdk` ou `/home/SeuUsuario/Android/Sdk`).


Adicionar devices virtuais android (AVD):
1. Abra o Android Studio.
2. Vá para "Tools" > "AVD Manager".
3. Clique em "Create Virtual Device".
4. Selecione um dispositivo da lista e clique em "Next".
5. Escolha uma imagem do sistema (recomenda-se usar uma imagem com Google APIs).
6. Clique em "Next" e depois em "Finish" para criar o AVD.  
7. Inicie o AVD clicando no ícone de play ao lado do dispositivo criado.

Se necessário, ative o hypervisor no Android Studio:
1. Vá para "File" > "Settings" (ou "Android Studio" > "Preferences" no macOS).
2. Vá para "Appearance & Behavior" > "System Settings" > "Android SDK".
3. Clique na aba "SDK Tools".
4. Marque a opção "Android Emulator Hypervisor Driver for AMD Processors" (se você estiver usando um processador AMD) ou "Intel x86 Emulator Accelerator (HAXM installer)" (se você estiver usando um processador Intel).
5. Clique em "OK" para instalar o driver.   

Caso necessário, ative no windows o Hyper-V:
1. Abra o "Painel de Controle".
2. Vá para "Programas" > "Ativar ou desativar recursos do Windows".
3. Marque a opção "Hyper-V" e clique em "OK".   
4. Reinicie o computador se solicitado.


Alguns casos precisa habilitar o Virtualização no BIOS:
1. Reinicie o computador e entre no BIOS/UEFI (geralmente pressionando `F2`, `Delete`, ou outra tecla específica durante a inicialização).
2. Procure por uma opção relacionada à virtualização, como "Intel VT-x", SVM Mode (para AMD), "AMD-V", ou "Virtualization Technology".
3. Ative essa opção.
4. Salve as alterações e saia do BIOS/UEFI.   


----

Configurar a variável de ambiente JAVA_HOME:
No Windows:
1. Clique com o botão direito em "Este PC" ou "Meu Computador" e selecione "Propriedades".
2. Clique em "Configurações avançadas do sistema".
3. Clique em "Variáveis de ambiente".
4. Na seção "Variáveis do sistema", clique em "Nova" e adicione:
   - Nome da variável: `JAVA_HOME`
   - Valor da variável: `C:\Program Files\Java\jdk-11.x.x` (substitua `jdk-11.x.x` pela versão instalada)
5. Clique em "OK" para salvar.  

Adicionar o caminho do JDK ao PATH:
1. Na mesma janela de "Variáveis de ambiente", encontre a variável `Path` na seção "Variáveis do sistema" e selecione-a.
2. Clique em "Editar".
3. Adicione um novo caminho: `%JAVA_HOME%\bin`.
4. Clique em "OK" para salvar todas as alterações.


No macOS ou Linux:
1. Abra o terminal.
2. Edite o arquivo de configuração do shell (por exemplo, `~/.bashrc`, `~/.bash_profile`, ou `~/.zshrc`).
3. Adicione a seguinte linha:
   ```bash
   export JAVA_HOME=$(/usr/libexec/java_home -v 11)
   ```
   ou, se você instalou o JDK manualmente:
   ```bash
   export JAVA_HOME=$HOME/Library/Java/JavaVirtualMachines/jdk-11.x.x.jdk/Contents/Home
   ```
4. Salve o arquivo e execute `source ~/.bashrc` ou `source ~/.zshrc` para aplicar as mudanças.  


Verificar se a variável JAVA_HOME está configurada corretamente:
```bash
echo $JAVA_HOME
```
```cmd
echo %JAVA_HOME%
``` 
 


Configurar a variável de ambiente ANDROID_HOME:
No Windows:
1. Clique com o botão direito em "Este PC" ou "Meu Computador" e selecione "Propriedades".
2. Clique em "Configurações avançadas do sistema".
3. Clique em "Variáveis de ambiente".
4. Na seção "Variáveis do sistema", clique em "Nova" e adicione:
   - Nome da variável: `ANDROID_HOME`
   - Valor da variável: `C:\Users\SeuUsuario\AppData\Local\Android\Sdk` (substitua "SeuUsuario" pelo seu nome de usuário)
5. Clique em "OK" para salvar.  

Adicionar o caminho do Android SDK ao PATH:
1. Na mesma janela de "Variáveis de ambiente", encontre a variável `Path` na seção "Variáveis do sistema" e selecione-a.
2. Clique em "Editar".
3. Adicione os seguintes caminhos:
   - `%ANDROID_HOME%\platform-tools`
   - `%ANDROID_HOME%\tools`
   - `%ANDROID_HOME%\tools\bin`
4. Clique em "OK" para salvar todas as alterações.

No macOS ou Linux:
1. Abra o terminal.
2. Edite o arquivo de configuração do shell (por exemplo, `~/.bashrc`, `~/.bash_profile`, ou `~/.zshrc`).
3. Adicione a seguinte linha:
   ```bash
   export ANDROID_HOME=$HOME/Library/Android/sdk        
   ```
   ou        
    ```bash
    export ANDROID_HOME=$HOME/Android/Sdk
    ```
4. Salve o arquivo e execute `source ~/.bashrc` ou `source ~/.zshrc` para aplicar as mudanças.
Verificar se a variável ANDROID_HOME está configurada corretamente:
echo $ANDROID_HOME
echo %ANDROID_HOME% 

Adicionar o caminho do Android SDK ao PATH no Mac ou Linux:
1. No mesmo arquivo de configuração do shell, adicione as seguintes linhas:
    ```bash 
    export PATH=$PATH:$ANDROID_HOME/platform-tools
    export PATH=$PATH:$ANDROID_HOME/tools
    export PATH=$PATH:$ANDROID_HOME/tools/bin
    ```
2. Salve o arquivo e execute `source ~/.bashrc` ou `source ~/.zshrc` para aplicar as mudanças.  
Verificar se o Android SDK está configurado corretamente:
```bash
adb version
```
```cmd
adb version
```
Verificar se o Android SDK está instalado:
```bash
sdkmanager --list
```
```cmd
sdkmanager --list
```     

---- 

Conectar a um dispositivo android:
Instalar o adb:
https://developer.android.com/studio/command-line/adb
https://developer.android.com/studio/command-line/sdkmanager    

Instalar o adb no windows:
https://developer.android.com/studio/releases/platform-tools
Instalar o adb no mac:
https://developer.android.com/studio/releases/platform-tools#downloads  
Instalar o adb no linux:
https://developer.android.com/studio/releases/platform-tools#downloads  
Verificar se o adb está instalado:
adb version

--
Conectar o dispositivo android via usb:
Habilitar a depuração usb no dispositivo android:
Configurações > Sobre o telefone > Toque várias vezes em "Número da versão" para ativar as opções de desenvolvedor.
Configurações > Opções de desenvolvedor > Ativar Depuração USB.
Conectar o dispositivo android ao computador via usb.
Listar dispositivos conectados:
adb devices
Listar dispositivos conectados com detalhes:
adb devices -l

----

Listar dispositivos conectados: 
adb devices

Listar dispositivos conectados com detalhes:
adb devices -l


Opcional: 
Configurar com docker:

Referências: 
https://github.com/fabioaraujoqa/appium-tutorial
https://www.youtube.com/watch?v=R1vm0RF66C8
https://hub.docker.com/r/appium/appium
https://github.com/budtmo/docker-android



---- 
Instalar e configurar webdriver.io
https://webdriver.io/docs/gettingstarted.html
https://webdriver.io/docs/installation.html
https://webdriver.io/docs/configurationfile.html

Instalar webdriver.io:
npm init wdio .

| Pergunta                                                 | Resposta Selecionada                          |
| -------------------------------------------------------- | --------------------------------------------- |
| What type of testing would you like to do?               | `E2E Testing - of Web or Mobile applications` |
| Where is your automation backend located?                | `On my local machine`                         |
| Which environment you would like to automate?            | `Mobile - native, hybrid, webview`            |
| Which mobile environment you'd like to automate?         | `Android - native, real devices`              |
| Which automation driver?                                 | `using UiAutomator2`                          |
| Which framework do you want to use?                      | `Mocha (https://mochajs.org/)`                |
| Do you want to use Typescript to write tests?            | `No`                                          |
| Do you want WebdriverIO to autogenerate some test files? | `No`                                          |
| Which reporter do you want to use?                       | (Pressione Enter para padrão: `spec`)         |
| Do you want to add a plugin to your test setup?          | (Pressione Enter para pular)                  |
| Would you like to include Visual Testing?                | `No`                                          |
| Do you want to add a service to your test setup?         | `appium`                                      |
| Do you want me to run `npm install`?                     | `Yes`                                         |









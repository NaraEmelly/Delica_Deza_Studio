# Delica Deza

- **Ship faster**: describe what you want to build and Lovable handles the code.
- **Stay in sync**: every change made in Lovable is committed straight to this repository.
- **Full ownership**: this code is yours. Push to `main` on GitHub and your changes sync back into Lovable, ready for your next prompt.

## Development

Prefer working locally? You need Node.js and npm — [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating).

```sh
git clone <this-repository-url>
cd <repository-name>
npm i
npm run dev
```

## Painel profissional e Supabase

O painel fica em `/painel`. A autenticação usa Supabase Auth; o cadastro de contas é
feito no Supabase, não pelo formulário público do site.

1. Abra o SQL Editor do seu projeto Supabase e execute `supabase/admin-setup.sql`.
2. Crie o usuário do profissional em **Authentication → Users**.
3. Promova esse usuário no SQL Editor, substituindo o UUID e o nome:

   ```sql
   update public.staff_profiles
   set role = 'owner', full_name = 'Nome profissional'
   where id = 'UUID-DO-USUARIO';
   ```

4. Convide os ajudantes em **Authentication → Users**. Novas contas são ajudantes
   por padrão; atribua cada serviço e seus valores na seção **Serviços e financeiro**.
5. Copie `.env.example` para `.env.local`, preencha a URL e a chave publicável (ou
   `anon`) do Supabase e reinicie o servidor.

Somente a chave publicável/anon pode ser usada no navegador. Nunca coloque a chave
`service_role` no site ou em arquivos versionados. O banco aplica políticas RLS:
o profissional controla agendamentos, clientes, acessos e finanças; o ajudante vê
somente os serviços e lançamentos financeiros atribuídos a ele.

O formulário registra os pedidos e os eventos de visita/envio no banco com consentimento
da cliente; ele continua abrindo o WhatsApp para confirmação manual. As fotos continuam
sendo compartilhadas no WhatsApp e apenas seus nomes são guardados no registro.

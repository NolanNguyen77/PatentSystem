import { useState } from 'react';
import { Lightbulb, Lock, User, ArrowRight, AlertCircle, Eye, EyeOff } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Alert, AlertDescription } from './ui/alert';
import { login, setAuthToken } from '../utils/api';

interface LoginPageProps {
  onLogin: (username: string) => void;
}

export function LoginPage({ onLogin }: LoginPageProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    
    try {
      // Call backend API for authentication
      const result = await login(username, password);

      if (result.success && result.token) {
        // Save JWT token to localStorage
        setAuthToken(result.token);
        localStorage.setItem('username', username);
        onLogin(username);
      } else {
        setError(result.message || 'ユーザー名またはパスワードが正しくありません');
      }
    } catch (err) {
      console.error('Login error:', err);
      setError('ログインに失敗しました。もう一度お試しください。');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-50 relative overflow-hidden">
      {/* Background decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-amber-200/30 to-orange-300/30 rounded-full blur-3xl"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-br from-yellow-200/30 to-amber-300/30 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-br from-orange-200/20 to-amber-200/20 rounded-full blur-3xl"></div>
      </div>

      {/* Login Card */}
      <Card className="w-full max-w-md border-0 shadow-2xl bg-white/90 backdrop-blur-md relative z-10">
        <CardHeader className="space-y-4 pb-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 flex items-center justify-center shadow-xl">
              <Lightbulb className="w-9 h-9 text-white" />
            </div>
            <h2 className="text-3xl bg-gradient-to-r from-amber-600 to-orange-600 bg-clip-text text-transparent">特許ナビ</h2>
          </div>
          <CardTitle className="text-2xl">ログイン</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {error && (
              <Alert variant="destructive" className="animate-in fade-in slide-in-from-top-2">
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="username" className="flex items-center gap-2">
                <User className="w-4 h-4" />
                ユーザー名
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="h-12 border-2 focus:border-amber-500"
                placeholder="ユーザー名を入力"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="flex items-center gap-2">
                <Lock className="w-4 h-4" />
                パスワード
              </Label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="h-12 border-2 focus:border-amber-500 pr-12"
                  placeholder="パスワードを入力"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition-colors focus:outline-none"
                  aria-label="パスワード表示切替"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>
            <div className="flex justify-end">
              <a href="#" className="text-sm text-amber-600 hover:text-amber-700 hover:underline">
                パスワードを忘れた方はこちら
              </a>
            </div>
            <Button 
              type="submit" 
              disabled={isLoading}
              className="w-full h-12 bg-gradient-to-r from-amber-500 to-orange-600 hover:from-amber-600 hover:to-orange-700 text-white shadow-lg disabled:opacity-50"
            >
              {isLoading ? 'ログイン中...' : 'ログイン'}
              {!isLoading && <ArrowRight className="ml-2 w-4 h-4" />}
            </Button>
          </form>
          
          <div className="mt-8 text-center text-xs text-gray-500">
            Copyright(C) I-Fine Corporation All Rights Reserved.
          </div>
        </CardContent>
      </Card>
    </div>
  );
}

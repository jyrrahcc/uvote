
import { useAuth } from "@/features/auth/context/AuthContext";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, User, Calendar } from "lucide-react";
import { formatDistanceToNow } from "date-fns";

interface WelcomeHeaderProps {
  userRole: string | null;
}

const WelcomeHeader = ({ userRole }: WelcomeHeaderProps) => {
  const { user } = useAuth();

  const isAdmin = userRole === 'admin';
  const lastLoginDate = user?.last_sign_in_at 
    ? new Date(user.last_sign_in_at) 
    : new Date();

  const getInitials = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name.charAt(0)}${user.user_metadata.last_name.charAt(0)}`;
    }
    if (user?.email) {
      return user.email.charAt(0).toUpperCase();
    }
    return "U";
  };

  const getFullName = () => {
    if (user?.user_metadata?.first_name && user?.user_metadata?.last_name) {
      return `${user.user_metadata.first_name} ${user.user_metadata.last_name}`;
    }
    return user?.email || "User";
  };

  return (
    <Card className="border border-muted/40 bg-card/50 shadow-sm hover:shadow-md transition-shadow">
      <CardContent className="p-6">
        <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
          <Avatar className="h-16 w-16 border-2 border-primary/20">
            {user?.user_metadata?.avatar_url ? (
              <AvatarImage src={user.user_metadata.avatar_url} alt={getFullName()} />
            ) : (
              <AvatarFallback className="bg-primary/10 text-primary text-xl">
                {getInitials()}
              </AvatarFallback>
            )}
          </Avatar>
          
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold">
                Welcome back, {user?.user_metadata?.first_name || getFullName().split(' ')[0] || 'User'}
              </h1>
              {userRole && (
                <Badge className={`${isAdmin ? 'bg-primary/10 text-primary' : 'bg-muted'}`}>
                  {userRole.charAt(0).toUpperCase() + userRole.slice(1)}
                </Badge>
              )}
            </div>
            
            <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-muted-foreground">
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span className="text-sm">{getFullName()}</span>
              </div>
              
              <div className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground/30" />
              
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="text-sm">
                  Last login: {formatDistanceToNow(lastLoginDate, { addSuffix: true })}
                </span>
              </div>
              
              {user?.created_at && (
                <>
                  <div className="hidden sm:block h-1 w-1 rounded-full bg-muted-foreground/30" />
                  <div className="flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5" />
                    <span className="text-sm">
                      Member since: {formatDistanceToNow(new Date(user.created_at), { addSuffix: true })}
                    </span>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};

export default WelcomeHeader;

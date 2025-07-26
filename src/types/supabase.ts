export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: '12.2.3 (519615d)';
  };
  public: {
    Tables: {
      Article: {
        Row: {
          articleBidId: number | null;
          artType: string | null;
          auctionId: number | null;
          box: boolean | null;
          boxMaterial: string | null;
          brand: string | null;
          category: Database['public']['Enums']['ArticleCategory'];
          codeNumber: string | null;
          color: string | null;
          description: string | null;
          documentation: boolean;
          estimatedValue: number | null;
          faceDiameter: string | null;
          height: number | null;
          id: number;
          images: string[] | null;
          length: number | null;
          material: string | null;
          movement: string | null;
          observations: string | null;
          ownerId: string | null;
          reservePrice: number | null;
          size: string | null;
          smell: Database['public']['Enums']['ArticleSmell'] | null;
          sold: boolean;
          soldPrice: number | null;
          startingPrice: number;
          state: Database['public']['Enums']['ArticleState'] | null;
          status: Database['public']['Enums']['ArticleStatus'];
          strapMaterial: string | null;
          title: string;
          weight: string | null;
          width: number | null;
          year: number | null;
        };
        Insert: {
          articleBidId?: number | null;
          artType?: string | null;
          auctionId?: number | null;
          box?: boolean | null;
          boxMaterial?: string | null;
          brand?: string | null;
          category?: Database['public']['Enums']['ArticleCategory'];
          codeNumber?: string | null;
          color?: string | null;
          description?: string | null;
          documentation?: boolean;
          estimatedValue?: number | null;
          faceDiameter?: string | null;
          height?: number | null;
          id?: number;
          images?: string[] | null;
          length?: number | null;
          material?: string | null;
          movement?: string | null;
          observations?: string | null;
          ownerId?: string | null;
          reservePrice?: number | null;
          size?: string | null;
          smell?: Database['public']['Enums']['ArticleSmell'] | null;
          sold?: boolean;
          soldPrice?: number | null;
          startingPrice: number;
          state?: Database['public']['Enums']['ArticleState'] | null;
          status?: Database['public']['Enums']['ArticleStatus'];
          strapMaterial?: string | null;
          title: string;
          weight?: string | null;
          width?: number | null;
          year?: number | null;
        };
        Update: {
          articleBidId?: number | null;
          artType?: string | null;
          auctionId?: number | null;
          box?: boolean | null;
          boxMaterial?: string | null;
          brand?: string | null;
          category?: Database['public']['Enums']['ArticleCategory'];
          codeNumber?: string | null;
          color?: string | null;
          description?: string | null;
          documentation?: boolean;
          estimatedValue?: number | null;
          faceDiameter?: string | null;
          height?: number | null;
          id?: number;
          images?: string[] | null;
          length?: number | null;
          material?: string | null;
          movement?: string | null;
          observations?: string | null;
          ownerId?: string | null;
          reservePrice?: number | null;
          size?: string | null;
          smell?: Database['public']['Enums']['ArticleSmell'] | null;
          sold?: boolean;
          soldPrice?: number | null;
          startingPrice?: number;
          state?: Database['public']['Enums']['ArticleState'] | null;
          status?: Database['public']['Enums']['ArticleStatus'];
          strapMaterial?: string | null;
          title?: string;
          weight?: string | null;
          width?: number | null;
          year?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'Article_articleBidId_fkey';
            columns: ['articleBidId'];
            isOneToOne: true;
            referencedRelation: 'ArticleBid';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'Article_ownerId_fkey';
            columns: ['ownerId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'articles_auctionid_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
        ];
      };
      ArticleBid: {
        Row: {
          articleId: number;
          available: boolean;
          countdownActive: boolean;
          countdownAmount: number;
          countdownFinish: string | null;
          currentValue: number;
          highestBidderId: string | null;
          highestBidderImage: string | null;
          highestBidderUsername: string | null;
          id: number;
        };
        Insert: {
          articleId: number;
          available?: boolean;
          countdownActive?: boolean;
          countdownAmount?: number;
          countdownFinish?: string | null;
          currentValue: number;
          highestBidderId?: string | null;
          highestBidderImage?: string | null;
          highestBidderUsername?: string | null;
          id?: number;
        };
        Update: {
          articleId?: number;
          available?: boolean;
          countdownActive?: boolean;
          countdownAmount?: number;
          countdownFinish?: string | null;
          currentValue?: number;
          highestBidderId?: string | null;
          highestBidderImage?: string | null;
          highestBidderUsername?: string | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'ArticleBid_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: true;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ArticleBid_highestBidderId_fkey';
            columns: ['highestBidderId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      ArticleOffer: {
        Row: {
          amount: number;
          articleSecondChanceId: number;
          createdAt: string;
          expiresAt: string | null;
          id: number;
          status: Database['public']['Enums']['OfferStatus'];
          userId: string;
        };
        Insert: {
          amount: number;
          articleSecondChanceId: number;
          createdAt?: string;
          expiresAt?: string | null;
          id?: number;
          status?: Database['public']['Enums']['OfferStatus'];
          userId: string;
        };
        Update: {
          amount?: number;
          articleSecondChanceId?: number;
          createdAt?: string;
          expiresAt?: string | null;
          id?: number;
          status?: Database['public']['Enums']['OfferStatus'];
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'ArticleOffer_articleSecondChanceId_fkey';
            columns: ['articleSecondChanceId'];
            isOneToOne: false;
            referencedRelation: 'ArticleSecondChance';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ArticleOffer_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      ArticleReview: {
        Row: {
          articleId: number;
          auctionId: number;
          comments: Json[];
          created_at: string;
          id: number;
        };
        Insert: {
          articleId: number;
          auctionId: number;
          comments: Json[];
          created_at?: string;
          id?: number;
        };
        Update: {
          articleId?: number;
          auctionId?: number;
          comments?: Json[];
          created_at?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'ArticleReview_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: true;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ArticleReview_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
        ];
      };
      ArticleSecondChance: {
        Row: {
          articleId: number;
          created_at: string;
          id: number;
          price: number;
          status: Database['public']['Enums']['ArticleSecondChanceStatus'];
          userId: string;
          userPaymentId: number | null;
        };
        Insert: {
          articleId: number;
          created_at?: string;
          id?: number;
          price?: number;
          status?: Database['public']['Enums']['ArticleSecondChanceStatus'];
          userId: string;
          userPaymentId?: number | null;
        };
        Update: {
          articleId?: number;
          created_at?: string;
          id?: number;
          price?: number;
          status?: Database['public']['Enums']['ArticleSecondChanceStatus'];
          userId?: string;
          userPaymentId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'ArticleSecondChance_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: true;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ArticleSecondChance_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'ArticleSecondChance_userPaymentId_fkey';
            columns: ['userPaymentId'];
            isOneToOne: false;
            referencedRelation: 'UserPayment';
            referencedColumns: ['id'];
          },
        ];
      };
      Auction: {
        Row: {
          category: Database['public']['Enums']['AuctionCategory'];
          country: string;
          id: number;
          image: string;
          mode: Database['public']['Enums']['AuctionMode'];
          startDate: string;
          status: Database['public']['Enums']['AuctionStatus'];
          title: string;
          userId: string;
          video: string | null;
        };
        Insert: {
          category?: Database['public']['Enums']['AuctionCategory'];
          country: string;
          id?: number;
          image: string;
          mode?: Database['public']['Enums']['AuctionMode'];
          startDate: string;
          status?: Database['public']['Enums']['AuctionStatus'];
          title: string;
          userId: string;
          video?: string | null;
        };
        Update: {
          category?: Database['public']['Enums']['AuctionCategory'];
          country?: string;
          id?: number;
          image?: string;
          mode?: Database['public']['Enums']['AuctionMode'];
          startDate?: string;
          status?: Database['public']['Enums']['AuctionStatus'];
          title?: string;
          userId?: string;
          video?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'auction_userid_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      AuctionReview: {
        Row: {
          auctionId: number;
          comments: Json[];
          created_at: string;
          id: number;
        };
        Insert: {
          auctionId: number;
          comments: Json[];
          created_at?: string;
          id?: number;
        };
        Update: {
          auctionId?: number;
          comments?: Json[];
          created_at?: string;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'AuctionReview_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: true;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
        ];
      };
      Bids: {
        Row: {
          amount: number;
          articleId: number;
          created_at: string;
          currentPrice: number;
          id: number;
          userId: string;
        };
        Insert: {
          amount: number;
          articleId: number;
          created_at?: string;
          currentPrice: number;
          id?: number;
          userId: string;
        };
        Update: {
          amount?: number;
          articleId?: number;
          created_at?: string;
          currentPrice?: number;
          id?: number;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'Bids_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: false;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'Bids_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      BlogArticle: {
        Row: {
          available: boolean;
          coverImage: string;
          createdAt: string;
          description: Json;
          id: number;
          image1: string | null;
          keyWords: Json;
          text1: Json;
          text2: Json;
          title: Json;
        };
        Insert: {
          available?: boolean;
          coverImage: string;
          createdAt?: string;
          description: Json;
          id?: number;
          image1?: string | null;
          keyWords: Json;
          text1: Json;
          text2: Json;
          title: Json;
        };
        Update: {
          available?: boolean;
          coverImage?: string;
          createdAt?: string;
          description?: Json;
          id?: number;
          image1?: string | null;
          keyWords?: Json;
          text1?: Json;
          text2?: Json;
          title?: Json;
        };
        Relationships: [];
      };
      DiscountCode: {
        Row: {
          code: string;
          createdAt: string | null;
          discountValue: number;
          expiresAt: string | null;
          id: string;
        };
        Insert: {
          code: string;
          createdAt?: string | null;
          discountValue: number;
          expiresAt?: string | null;
          id?: string;
        };
        Update: {
          code?: string;
          createdAt?: string | null;
          discountValue?: number;
          expiresAt?: string | null;
          id?: string;
        };
        Relationships: [];
      };
      Invoice: {
        Row: {
          auctionId: number | null;
          billingAddress: string;
          billingName: string;
          commission: number | null;
          correlativeNumber: number;
          createdAt: string | null;
          discount: number | null;
          id: string;
          invoiceId: string;
          invoiceType: Database['public']['Enums']['InvoiceType'];
          issuedAt: string | null;
          items: Json;
          paymentId: number | null;
          shipping: number;
          subtotal: number;
          taxes: number;
          total: number;
          userId: string | null;
          vatNumber: string | null;
        };
        Insert: {
          auctionId?: number | null;
          billingAddress: string;
          billingName: string;
          commission?: number | null;
          correlativeNumber: number;
          createdAt?: string | null;
          discount?: number | null;
          id?: string;
          invoiceId: string;
          invoiceType: Database['public']['Enums']['InvoiceType'];
          issuedAt?: string | null;
          items: Json;
          paymentId?: number | null;
          shipping: number;
          subtotal: number;
          taxes: number;
          total: number;
          userId?: string | null;
          vatNumber?: string | null;
        };
        Update: {
          auctionId?: number | null;
          billingAddress?: string;
          billingName?: string;
          commission?: number | null;
          correlativeNumber?: number;
          createdAt?: string | null;
          discount?: number | null;
          id?: string;
          invoiceId?: string;
          invoiceType?: Database['public']['Enums']['InvoiceType'];
          issuedAt?: string | null;
          items?: Json;
          paymentId?: number | null;
          shipping?: number;
          subtotal?: number;
          taxes?: number;
          total?: number;
          userId?: string | null;
          vatNumber?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'Invoice_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'Invoice_paymentId_fkey';
            columns: ['paymentId'];
            isOneToOne: false;
            referencedRelation: 'UserPayment';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'Invoice_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      LiveAuction: {
        Row: {
          articlesOrder: number[];
          auctionId: number;
          currentArticleBidId: number | null;
          id: number;
        };
        Insert: {
          articlesOrder: number[];
          auctionId: number;
          currentArticleBidId?: number | null;
          id?: number;
        };
        Update: {
          articlesOrder?: number[];
          auctionId?: number;
          currentArticleBidId?: number | null;
          id?: number;
        };
        Relationships: [
          {
            foreignKeyName: 'LiveAuction_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: true;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'LiveAuction_currentArticleBidId_fkey';
            columns: ['currentArticleBidId'];
            isOneToOne: false;
            referencedRelation: 'ArticleBid';
            referencedColumns: ['id'];
          },
        ];
      };
      PhoneOTP: {
        Row: {
          attemptCount: number | null;
          createdAt: string;
          expiresAt: string;
          id: string;
          otp: string;
          phoneNumber: string;
          userId: string | null;
          validated: boolean | null;
        };
        Insert: {
          attemptCount?: number | null;
          createdAt?: string;
          expiresAt: string;
          id?: string;
          otp: string;
          phoneNumber: string;
          userId?: string | null;
          validated?: boolean | null;
        };
        Update: {
          attemptCount?: number | null;
          createdAt?: string;
          expiresAt?: string;
          id?: string;
          otp?: string;
          phoneNumber?: string;
          userId?: string | null;
          validated?: boolean | null;
        };
        Relationships: [
          {
            foreignKeyName: 'PhoneOTP_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      User: {
        Row: {
          acceptedTerms: string;
          active: boolean;
          address: string | null;
          country: string | null;
          dni: string | null;
          email: string;
          emailVerified: string | null;
          id: string;
          isHostAuctioneer: boolean;
          lastName: string;
          name: string;
          phoneNumber: string | null;
          phoneValidated: boolean;
          postalCode: string | null;
          profilePicture: string | null;
          province: string | null;
          role: Database['public']['Enums']['UserRole'];
          socialMedia: string | null;
          storeName: string | null;
          town: string | null;
          username: string;
          webPage: string | null;
        };
        Insert: {
          acceptedTerms: string;
          active?: boolean;
          address?: string | null;
          country?: string | null;
          dni?: string | null;
          email: string;
          emailVerified?: string | null;
          id: string;
          isHostAuctioneer?: boolean;
          lastName: string;
          name: string;
          phoneNumber?: string | null;
          phoneValidated?: boolean;
          postalCode?: string | null;
          profilePicture?: string | null;
          province?: string | null;
          role?: Database['public']['Enums']['UserRole'];
          socialMedia?: string | null;
          storeName?: string | null;
          town?: string | null;
          username: string;
          webPage?: string | null;
        };
        Update: {
          acceptedTerms?: string;
          active?: boolean;
          address?: string | null;
          country?: string | null;
          dni?: string | null;
          email?: string;
          emailVerified?: string | null;
          id?: string;
          isHostAuctioneer?: boolean;
          lastName?: string;
          name?: string;
          phoneNumber?: string | null;
          phoneValidated?: boolean;
          postalCode?: string | null;
          profilePicture?: string | null;
          province?: string | null;
          role?: Database['public']['Enums']['UserRole'];
          socialMedia?: string | null;
          storeName?: string | null;
          town?: string | null;
          username?: string;
          webPage?: string | null;
        };
        Relationships: [];
      };
      UserAddress: {
        Row: {
          address: string;
          city: string;
          country: string;
          created_at: string | null;
          id: string;
          nameAddress: string | null;
          postalCode: string;
          primaryAddress: boolean | null;
          state: string;
          userId: string;
        };
        Insert: {
          address: string;
          city: string;
          country: string;
          created_at?: string | null;
          id?: string;
          nameAddress?: string | null;
          postalCode: string;
          primaryAddress?: boolean | null;
          state: string;
          userId: string;
        };
        Update: {
          address?: string;
          city?: string;
          country?: string;
          created_at?: string | null;
          id?: string;
          nameAddress?: string | null;
          postalCode?: string;
          primaryAddress?: boolean | null;
          state?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserAddress_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserArticlesWon: {
        Row: {
          articleId: number;
          changedBidder: boolean;
          created_at: string;
          id: number;
          ownerId: string | null;
          status: Database['public']['Enums']['WonArticleStatus'];
          userId: string;
          userPaymentId: number | null;
        };
        Insert: {
          articleId: number;
          changedBidder?: boolean;
          created_at?: string;
          id?: number;
          ownerId?: string | null;
          status?: Database['public']['Enums']['WonArticleStatus'];
          userId: string;
          userPaymentId?: number | null;
        };
        Update: {
          articleId?: number;
          changedBidder?: boolean;
          created_at?: string;
          id?: number;
          ownerId?: string | null;
          status?: Database['public']['Enums']['WonArticleStatus'];
          userId?: string;
          userPaymentId?: number | null;
        };
        Relationships: [
          {
            foreignKeyName: 'UserArticlesWon_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: true;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserArticlesWon_ownerId_fkey';
            columns: ['ownerId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserArticlesWon_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserArticlesWon_userPaymentId_fkey';
            columns: ['userPaymentId'];
            isOneToOne: false;
            referencedRelation: 'UserPayment';
            referencedColumns: ['id'];
          },
        ];
      };
      UserAuctionToken: {
        Row: {
          auctionId: number;
          createdAt: string;
          expiresAt: string;
          token: string;
          userId: string;
        };
        Insert: {
          auctionId: number;
          createdAt?: string;
          expiresAt: string;
          token: string;
          userId: string;
        };
        Update: {
          auctionId?: number;
          createdAt?: string;
          expiresAt?: string;
          token?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserAuctionToken_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserAuctionToken_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserAuctionTokenAnon: {
        Row: {
          auctionId: number;
          createdAt: string;
          expiresAt: string;
          token: string;
          userEmail: string;
        };
        Insert: {
          auctionId: number;
          createdAt?: string;
          expiresAt: string;
          token: string;
          userEmail: string;
        };
        Update: {
          auctionId?: number;
          createdAt?: string;
          expiresAt?: string;
          token?: string;
          userEmail?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserAuctionTokenAnon_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
        ];
      };
      UserBillingInfo: {
        Row: {
          billingAddress: string;
          billingName: string;
          createdAt: string | null;
          id: string;
          label: string | null;
          updatedAt: string | null;
          userId: string;
          vatNumber: string | null;
        };
        Insert: {
          billingAddress: string;
          billingName: string;
          createdAt?: string | null;
          id?: string;
          label?: string | null;
          updatedAt?: string | null;
          userId: string;
          vatNumber?: string | null;
        };
        Update: {
          billingAddress?: string;
          billingName?: string;
          createdAt?: string | null;
          id?: string;
          label?: string | null;
          updatedAt?: string | null;
          userId?: string;
          vatNumber?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'UserBillingInfo_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserDiscountCode: {
        Row: {
          discountCodeId: string | null;
          id: string;
          usedAt: string | null;
          userId: string | null;
        };
        Insert: {
          discountCodeId?: string | null;
          id?: string;
          usedAt?: string | null;
          userId?: string | null;
        };
        Update: {
          discountCodeId?: string | null;
          id?: string;
          usedAt?: string | null;
          userId?: string | null;
        };
        Relationships: [
          {
            foreignKeyName: 'UserDiscountCode_discountCodeId_fkey';
            columns: ['discountCodeId'];
            isOneToOne: false;
            referencedRelation: 'DiscountCode';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserDiscountCode_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserFollowArticle: {
        Row: {
          articleId: number;
          id: string;
          userId: string;
        };
        Insert: {
          articleId: number;
          id?: string;
          userId: string;
        };
        Update: {
          articleId?: number;
          id?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserFollowArticle_articleId_fkey';
            columns: ['articleId'];
            isOneToOne: false;
            referencedRelation: 'Article';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserFollowArticle_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserFollowAuction: {
        Row: {
          auctionId: number;
          id: string;
          userId: string;
        };
        Insert: {
          auctionId: number;
          id?: string;
          userId: string;
        };
        Update: {
          auctionId?: number;
          id?: string;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserFollowAuction_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserFollowAuction_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserIVS: {
        Row: {
          chatArn: string;
          stageArn: string;
          stageToken: string | null;
          userId: string;
        };
        Insert: {
          chatArn: string;
          stageArn: string;
          stageToken?: string | null;
          userId: string;
        };
        Update: {
          chatArn?: string;
          stageArn?: string;
          stageToken?: string | null;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserIVS_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      UserPayment: {
        Row: {
          articlesAmount: number | null;
          articlesPaid: number[];
          auctionId: number | null;
          chargeId: string | null;
          commissionAmount: number | null;
          createdAt: string;
          description: string;
          discountAmount: number | null;
          discountCode: string | null;
          errorCode: string | null;
          id: number;
          paymentIntent: string | null;
          receiptUrl: string | null;
          shippingAmount: number | null;
          shippingCourier: string | null;
          shippingNumber: string | null;
          status: Database['public']['Enums']['PaymentStatus'];
          taxesAmount: number | null;
          totalAmount: number;
          userAddressId: string | null;
          userId: string;
        };
        Insert: {
          articlesAmount?: number | null;
          articlesPaid: number[];
          auctionId?: number | null;
          chargeId?: string | null;
          commissionAmount?: number | null;
          createdAt?: string;
          description: string;
          discountAmount?: number | null;
          discountCode?: string | null;
          errorCode?: string | null;
          id?: number;
          paymentIntent?: string | null;
          receiptUrl?: string | null;
          shippingAmount?: number | null;
          shippingCourier?: string | null;
          shippingNumber?: string | null;
          status?: Database['public']['Enums']['PaymentStatus'];
          taxesAmount?: number | null;
          totalAmount: number;
          userAddressId?: string | null;
          userId: string;
        };
        Update: {
          articlesAmount?: number | null;
          articlesPaid?: number[];
          auctionId?: number | null;
          chargeId?: string | null;
          commissionAmount?: number | null;
          createdAt?: string;
          description?: string;
          discountAmount?: number | null;
          discountCode?: string | null;
          errorCode?: string | null;
          id?: number;
          paymentIntent?: string | null;
          receiptUrl?: string | null;
          shippingAmount?: number | null;
          shippingCourier?: string | null;
          shippingNumber?: string | null;
          status?: Database['public']['Enums']['PaymentStatus'];
          taxesAmount?: number | null;
          totalAmount?: number;
          userAddressId?: string | null;
          userId?: string;
        };
        Relationships: [
          {
            foreignKeyName: 'UserPayment_auctionId_fkey';
            columns: ['auctionId'];
            isOneToOne: false;
            referencedRelation: 'Auction';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserPayment_userAddressId_fkey';
            columns: ['userAddressId'];
            isOneToOne: false;
            referencedRelation: 'UserAddress';
            referencedColumns: ['id'];
          },
          {
            foreignKeyName: 'UserPayment_userId_fkey';
            columns: ['userId'];
            isOneToOne: false;
            referencedRelation: 'User';
            referencedColumns: ['id'];
          },
        ];
      };
      VerificationToken: {
        Row: {
          email: string;
          expires: string;
          id: string;
          token: string;
        };
        Insert: {
          email: string;
          expires: string;
          id: string;
          token: string;
        };
        Update: {
          email?: string;
          expires?: string;
          id?: string;
          token?: string;
        };
        Relationships: [];
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      auto_advance_article: {
        Args: { p_auction_id: number; p_hard_timeout_ms: number };
        Returns: Json;
      };
      auto_manual_start: {
        Args: {
          p_auction_id: number;
          p_desired_article_id: number;
          p_hard_timeout_ms: number;
        };
        Returns: Json;
      };
      auto_start_auction: {
        Args: { p_auction_id: number; p_hard_timeout_ms: number };
        Returns: Json;
      };
      auto_start_countdown: {
        Args: { p_auction_id: number };
        Returns: Json;
      };
      cancel_article_acquisition_send_to_online_store: {
        Args: { article_id: number; user_id: string; sold_price: number };
        Returns: Json;
      };
      create_bid: {
        Args: {
          p_article_id: number;
          p_amount: number;
          p_client_current_amount: number;
          p_user_id: string;
          p_username: string;
          p_user_image: string;
        };
        Returns: Json;
      };
      custom_access_token_hook: {
        Args: { event: Json };
        Returns: Json;
      };
      filter_auctions_for_calendar: {
        Args: {
          today: string;
          start_of_month: string;
          end_of_month: string;
          start_of_next_month: string;
          end_of_next_month: string;
          category_param?: Database['public']['Enums']['AuctionCategory'];
        };
        Returns: Json;
      };
      grant_article_to_second_user: {
        Args: { article_id: number; second_user_id: string; new_price: number };
        Returns: Json;
      };
      sell_article: {
        Args: { article_id: number };
        Returns: Json;
      };
    };
    Enums: {
      ArticleCategory: 'BAG' | 'ART' | 'JEWERLY' | 'WATCH';
      ArticleSecondChanceStatus: 'NOT_AVAILABLE' | 'AVAILABLE' | 'SOLD';
      ArticleSmell: 'TOBACCO' | 'PERFUME' | 'HUMIDITY' | 'NO_SMELL' | 'OTHER';
      ArticleState:
        | 'NEVER_WORN_WITH_TAG'
        | 'NEVER_WORN'
        | 'VERY_GOOD_CONDITION'
        | 'GOOD_CONDITION'
        | 'FAIR_CONDITION';
      ArticleStatus:
        | 'NOT_PUBLISHED'
        | 'NEED_CHANGES'
        | 'CHANGES_MADE'
        | 'APPROVED'
        | 'PUBLISHED';
      AuctionCategory: 'BAGS' | 'ART' | 'JEWERLY' | 'WATCHES';
      AuctionMode: 'LIVE' | 'AUTOMATIC';
      AuctionStatus:
        | 'NOT_AVAILABLE'
        | 'NEED_CHANGES'
        | 'CHANGES_MADE'
        | 'WAITING_MIN_ARTICLES_AMOUNT'
        | 'PARTIALLY_AVAILABLE'
        | 'AVAILABLE'
        | 'LIVE'
        | 'FINISHED'
        | 'IN_REVIEW'
        | 'PARTIALLY_AVAILABLE_CHANGES_MADE';
      InvoiceType: 'USER' | 'AUCTIONEER' | 'HOST_AUCTIONEER';
      LiveAuctionState: 'PENDING' | 'LIVE' | 'FINISHED';
      OfferStatus: 'PENDING' | 'REJECTED' | 'ACCEPTED';
      PaymentStatus: 'PENDING' | 'APPROVED' | 'REJECTED';
      UserRole: 'ADMIN' | 'USER' | 'AUCTIONEER';
      WonArticleStatus: 'NOT_PAID' | 'DRAFT' | 'PAID';
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
}

type DatabaseWithoutInternals = Omit<Database, '__InternalSupabase'>;

type DefaultSchema = DatabaseWithoutInternals[Extract<
  keyof Database,
  'public'
>];

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema['Tables'] & DefaultSchema['Views'])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Views'])[TableName] extends {
      Row: infer R;
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema['Tables'] &
        DefaultSchema['Views'])
    ? (DefaultSchema['Tables'] &
        DefaultSchema['Views'])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R;
      }
      ? R
      : never
    : never;

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Insert: infer I;
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I;
      }
      ? I
      : never
    : never;

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema['Tables']
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables']
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions['schema']]['Tables'][TableName] extends {
      Update: infer U;
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema['Tables']
    ? DefaultSchema['Tables'][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U;
      }
      ? U
      : never
    : never;

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema['Enums']
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums']
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions['schema']]['Enums'][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema['Enums']
    ? DefaultSchema['Enums'][DefaultSchemaEnumNameOrOptions]
    : never;

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema['CompositeTypes']
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals;
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes']
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals;
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions['schema']]['CompositeTypes'][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema['CompositeTypes']
    ? DefaultSchema['CompositeTypes'][PublicCompositeTypeNameOrOptions]
    : never;

export const Constants = {
  public: {
    Enums: {
      ArticleCategory: ['BAG', 'ART', 'JEWERLY', 'WATCH'],
      ArticleSecondChanceStatus: ['NOT_AVAILABLE', 'AVAILABLE', 'SOLD'],
      ArticleSmell: ['TOBACCO', 'PERFUME', 'HUMIDITY', 'NO_SMELL', 'OTHER'],
      ArticleState: [
        'NEVER_WORN_WITH_TAG',
        'NEVER_WORN',
        'VERY_GOOD_CONDITION',
        'GOOD_CONDITION',
        'FAIR_CONDITION',
      ],
      ArticleStatus: [
        'NOT_PUBLISHED',
        'NEED_CHANGES',
        'CHANGES_MADE',
        'APPROVED',
        'PUBLISHED',
      ],
      AuctionCategory: ['BAGS', 'ART', 'JEWERLY', 'WATCHES'],
      AuctionMode: ['LIVE', 'AUTOMATIC'],
      AuctionStatus: [
        'NOT_AVAILABLE',
        'NEED_CHANGES',
        'CHANGES_MADE',
        'WAITING_MIN_ARTICLES_AMOUNT',
        'PARTIALLY_AVAILABLE',
        'AVAILABLE',
        'LIVE',
        'FINISHED',
        'IN_REVIEW',
        'PARTIALLY_AVAILABLE_CHANGES_MADE',
      ],
      InvoiceType: ['USER', 'AUCTIONEER', 'HOST_AUCTIONEER'],
      LiveAuctionState: ['PENDING', 'LIVE', 'FINISHED'],
      OfferStatus: ['PENDING', 'REJECTED', 'ACCEPTED'],
      PaymentStatus: ['PENDING', 'APPROVED', 'REJECTED'],
      UserRole: ['ADMIN', 'USER', 'AUCTIONEER'],
      WonArticleStatus: ['NOT_PAID', 'DRAFT', 'PAID'],
    },
  },
} as const;

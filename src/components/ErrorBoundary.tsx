/**
 * Error Boundary Component
 *
 * Catches JavaScript errors anywhere in the child component tree
 * and displays a fallback UI instead of crashing the app
 */

import React, { Component, ErrorInfo, ReactNode } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { log } from "@/src/utils/logger";
import { Ionicons } from "@expo/vector-icons";
import { SafeAreaView } from "react-native-safe-area-context";

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
  onError?: (error: Error, errorInfo: ErrorInfo) => void;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
  errorInfo: ErrorInfo | null;
}

export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
    };
  }

  static getDerivedStateFromError(error: Error): Partial<ErrorBoundaryState> {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    this.setState({ errorInfo });

    // Log error to console
    log.error("ErrorBoundary caught error:", error);
    log.error("Component stack:", errorInfo.componentStack);

    // Call optional error handler
    this.props.onError?.(error, errorInfo);
  }

  handleRetry = (): void => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
    });
  };

  render(): ReactNode {
    if (this.state.hasError) {
      // Custom fallback UI provided
      if (this.props.fallback) {
        return this.props.fallback;
      }

      // Default error UI
      return (
        <SafeAreaView style={styles.container}>
          <View style={styles.content}>
            <Ionicons name="warning-outline" size={64} color="#e94560" />

            <Text style={styles.title}>Something Went Wrong</Text>

            <Text style={styles.message}>The app encountered an unexpected error. You can try again or restart the app.</Text>

            <Pressable style={styles.button} onPress={this.handleRetry}>
              <Ionicons name="refresh-outline" size={20} color="#fff" />
              <Text style={styles.buttonText}>Try Again</Text>
            </Pressable>

            {/* Error details (collapsed by default in production) */}
            {__DEV__ && this.state.error && (
              <ScrollView style={styles.errorDetails}>
                <Text style={styles.errorTitle}>Error Details:</Text>
                <Text style={styles.errorText}>
                  {this.state.error.name}: {this.state.error.message}
                </Text>
                {this.state.errorInfo?.componentStack && <Text style={styles.stackText}>{this.state.errorInfo.componentStack}</Text>}
              </ScrollView>
            )}
          </View>
        </SafeAreaView>
      );
    }

    return this.props.children;
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1a1a2e",
  },
  content: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: "#eaeaea",
    marginTop: 16,
    marginBottom: 12,
    textAlign: "center",
  },
  message: {
    fontSize: 16,
    color: "#a0a0a0",
    textAlign: "center",
    marginBottom: 24,
    lineHeight: 24,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#e94560",
    paddingVertical: 14,
    paddingHorizontal: 24,
    borderRadius: 12,
    gap: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  errorDetails: {
    marginTop: 24,
    maxHeight: 200,
    width: "100%",
    backgroundColor: "rgba(0, 0, 0, 0.3)",
    borderRadius: 8,
    padding: 12,
  },
  errorTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: "#e94560",
    marginBottom: 8,
  },
  errorText: {
    fontSize: 12,
    color: "#eaeaea",
    fontFamily: "monospace",
    marginBottom: 8,
  },
  stackText: {
    fontSize: 10,
    color: "#a0a0a0",
    fontFamily: "monospace",
  },
});
